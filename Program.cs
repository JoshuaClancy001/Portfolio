using System.Text;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Portfolio.BackgroundServices;
using Portfolio.Data;
using Portfolio.Middleware;
using Portfolio.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Database ────────────────────────────────────────────────────────────────
var connectionString =
    Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration["DATABASE_URL"]
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("DATABASE_URL is not configured.");

// Supabase (and Railway) provide postgres:// URIs; convert to Npgsql key=value format
if (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://"))
{
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':', 2);
    connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')}" +
                       $";Username={userInfo[0]};Password={Uri.UnescapeDataString(userInfo[1])}" +
                       $";SSL Mode=Require;Trust Server Certificate=true";
}

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

// ── Authentication ──────────────────────────────────────────────────────────
// Cookie auth for the admin Razor Pages UI; JWT for the REST API.
// Deliberately chose manual auth over ASP.NET Core Identity — single-admin
// system doesn't need Identity's full user-management infrastructure.

var jwtSecret =
    Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("JWT_SECRET is not configured.");

builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Admin/Login";
        options.ExpireTimeSpan = TimeSpan.FromHours(8);
        options.SlidingExpiration = true;
    })
    .AddJwtBearer(options =>
    {
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

// ── Services ────────────────────────────────────────────────────────────────
// Scoped: one instance per HTTP request — correct for EF Core DbContext wrappers.
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IChangelogService, ChangelogService>();
builder.Services.AddScoped<IMessageService, MessageService>();
// Transient: auth is stateless, no shared state between calls.
builder.Services.AddTransient<IAuthService, AuthService>();

// ── Background service ──────────────────────────────────────────────────────
// Runs MigrateAsync + seeds the DB on startup. Uses IServiceScopeFactory to
// create a scope for the Scoped AppDbContext (can't inject Scoped into Singleton).
builder.Services.AddHostedService<DatabaseSeederService>();

// ── Web ─────────────────────────────────────────────────────────────────────
builder.Services.AddRazorPages();
builder.Services.AddControllers();

var app = builder.Build();

// Global exception handler returns RFC 7807 Problem Details for unhandled exceptions
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();
app.MapControllers();

app.Run();
