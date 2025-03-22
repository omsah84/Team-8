using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using System.ComponentModel.DataAnnotations;

// ✅ Create Web Application Builder
var builder = WebApplication.CreateBuilder(args);

// ✅ Enable Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// ✅ Enable CORS for Frontend Access
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
         policy.WithOrigins("http://localhost:5173") // ✅ Allow only frontend origin
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()); // ✅ Required for cookies
});

// ✅ Configure Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ✅ Identity & Authentication
builder.Services.AddIdentity<User, IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// ✅ Ensure JWT Secret Key is Set
var jwtSecret = builder.Configuration["JwtSettings:Secret"];
if (string.IsNullOrEmpty(jwtSecret) || jwtSecret.Length < 32)
    throw new ArgumentException("JWT Secret must be at least 32 characters long.");

// ✅ Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// ✅ Apply CORS Before Authentication & Authorization
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// ✅ Middleware: Handle Unauthorized Requests as JSON
app.UseStatusCodePages(async context =>
{
    var response = context.HttpContext.Response;
    if (response.StatusCode == 401) // Unauthorized
    {
        response.ContentType = "application/json";
        await response.WriteAsync("{\"error\": \"Unauthorized access. Please log in with a valid token.\"}");
    }
});

// ==============================
// ✅ USER AUTHENTICATION ROUTES
// ==============================

// ✅ **User Registration**
app.MapPost("/api/auth/register", async (UserManager<User> userManager, [FromBody] RegisterDTO model) =>
{
    if (string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Password) || string.IsNullOrEmpty(model.Role))
        return Results.BadRequest(new { message = "All fields (email, password, role) are required." });

    var existingUser = await userManager.FindByEmailAsync(model.Email);
    if (existingUser != null)
        return Results.BadRequest(new { message = "User already exists." });

    var user = new User { UserName = model.Email, Email = model.Email, Role = model.Role };
    var result = await userManager.CreateAsync(user, model.Password);

    return result.Succeeded ? Results.Ok(new { message = "User registered successfully!" }) :
                              Results.BadRequest(new { message = "Registration failed.", errors = result.Errors });
});

// ✅ **User Login & Secure JWT Token Handling**
app.MapPost("/api/auth/login", async (UserManager<User> userManager, [FromBody] LoginDTO model, HttpContext httpContext) =>
{
    var user = await userManager.FindByEmailAsync(model.Email);
    if (user == null || !await userManager.CheckPasswordAsync(user, model.Password))
        return Results.Json(new { message = "Invalid email or password." }, statusCode: 401); // ✅ Corrected JSON response

    // ✅ Generate JWT Token
    var tokenHandler = new JwtSecurityTokenHandler();
    var key = Encoding.UTF8.GetBytes(jwtSecret);
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Role, user.Role ?? ""),
            new Claim("userId", user.Id ?? "")  // ✅ Store userId in token
        }),
        Expires = DateTime.UtcNow.AddHours(1),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
    };
    var token = tokenHandler.CreateToken(tokenDescriptor);
    var jwtToken = tokenHandler.WriteToken(token);

    // ✅ Set JWT Token in Secure HTTP-Only Cookie
    httpContext.Response.Cookies.Append("jwt", jwtToken, new CookieOptions
    {
        HttpOnly = true,  // ✅ Prevents JavaScript access
        Secure = !builder.Environment.IsDevelopment(), // ✅ Secure in production only
        SameSite = SameSiteMode.Strict,
        Expires = DateTime.UtcNow.AddHours(1),
        Path = "/" // ✅ Ensures cookie is accessible on all API routes
    });

    // ✅ Store UserID in Secure HTTP-Only Cookie
    httpContext.Response.Cookies.Append("userId", user.Id, new CookieOptions
    {
        HttpOnly = true,
        Secure = !builder.Environment.IsDevelopment(),
        SameSite = SameSiteMode.Strict,
        Expires = DateTime.UtcNow.AddHours(1),
        Path = "/"
    });

    // ✅ Send user info in response (without sending token in body)
    return Results.Ok(new { message = "Login successful!", role = user.Role, userId = user.Id });
});


// ==============================
// ✅ BUDGET REQUEST ROUTES
// ==============================

// ✅ **Submit Budget Request (Employees Only)**
app.MapPost("/api/budgets", async (AppDbContext db, [FromBody] BudgetRequestDTO model) =>
{
    // ✅ Validate `userId` is present in the request body
    if (string.IsNullOrEmpty(model.UserId))
        return Results.BadRequest(new { message = "User ID is required to submit a budget." });

    // ✅ Convert DTO into BudgetRequest entity
    var budgetRequest = new BudgetRequest
    {
        Title = model.Title,
        Amount = model.Amount,
        RequestedBy = model.UserId,  // ✅ Assign UserId from the request body
        Status = "Pending",
        CreatedAt = DateTime.UtcNow
    };

    db.BudgetRequests.Add(budgetRequest);
    await db.SaveChangesAsync();

    return Results.Ok(new { message = "Budget request submitted successfully!", data = budgetRequest });
});


/// **View Own Budget Requests (Employees) Using Cookies**
app.MapGet("/api/budgets/user", async (AppDbContext db, HttpContext httpContext) =>
{
    // Retrieve 'userId' from cookies safely
    if (!httpContext.Request.Cookies.TryGetValue("userId", out var userId) || string.IsNullOrEmpty(userId))
    {
        return Results.Json(new { message = "User ID missing from cookies. Please log in again." }, statusCode: 401);
    }

    // Fetch budget requests for the logged-in user
    var budgets = await db.BudgetRequests
        .Where(b => b.RequestedBy == userId)
        .ToListAsync();

    return Results.Json(budgets);
});


// ✅ **View Pending Requests (Managers Only)**
app.MapGet("/api/budgets/pending", async (AppDbContext db) =>
{
    var pendingBudgets = await db.BudgetRequests.Where(b => b.Status == "Pending").ToListAsync();
    return Results.Ok(pendingBudgets);
});

// ✅ **Approve/Reject Budget Requests (Managers Only)**
app.MapPut("/api/budgets/{id}/status", async (AppDbContext db, int id, [FromBody] StatusUpdateDTO model) =>
{
    // Validate that the status is either "Approved" or "Rejected"
    if (model.Status != "Approved" && model.Status != "Rejected")
    {
        return Results.BadRequest(new { message = "Invalid status. Must be 'Approved' or 'Rejected'." });
    }

    // Find the budget request by id
    var budget = await db.BudgetRequests.FindAsync(id);
    if (budget == null)
    {
        return Results.NotFound(new { message = "Budget request not found." });
    }

    // Update the budget status and save changes
    budget.Status = model.Status;
    await db.SaveChangesAsync();

    return Results.Ok(new { message = $"Budget request {model.Status} successfully!", data = budget });
});


// ✅ **View All Budget Requests (Admin Only)**
app.MapGet("/api/budgets", async (AppDbContext db) =>
{
    return Results.Ok(await db.BudgetRequests.ToListAsync());
});

app.Run();

// ==============================
// ✅ DATABASE & MODELS (IN SAME FILE)
// ==============================

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<BudgetRequest> BudgetRequests { get; set; }
}

public class User : IdentityUser
{
    public string Role { get; set; } = string.Empty;
}

public class BudgetRequest
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Pending";
    public string RequestedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ==============================
// ✅ DTOs (DATA TRANSFER OBJECTS)
// ==============================

public class RegisterDTO
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class LoginDTO
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class StatusUpdateDTO
{
    public string Status { get; set; } = string.Empty;
}

public class BudgetRequestDTO
{
    [Required(ErrorMessage = "User ID is required.")]
    public string UserId { get; set; } = string.Empty;

    [Required(ErrorMessage = "Title is required.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Amount is required.")]
    [Range(1, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
    public decimal Amount { get; set; }
}
