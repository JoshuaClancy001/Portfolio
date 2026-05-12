using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Portfolio.Common;
using Portfolio.DTOs.Auth;

namespace Portfolio.Services;

public class AuthService : IAuthService
{
    private readonly string _adminUsername;
    private readonly string _adminPasswordHash;
    private readonly string _jwtSecret;

    public AuthService(IConfiguration configuration)
    {
        _adminUsername = Environment.GetEnvironmentVariable("ADMIN_USERNAME")
            ?? configuration["Admin:Username"]
            ?? string.Empty;
        _adminPasswordHash = Environment.GetEnvironmentVariable("ADMIN_PASSWORD_HASH")
            ?? configuration["Admin:PasswordHash"]
            ?? string.Empty;
        _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
            ?? configuration["Jwt:Secret"]
            ?? throw new InvalidOperationException("JWT_SECRET is not configured.");
    }

    public Result<LoginResponse> Login(LoginRequest request)
    {
        if (string.IsNullOrEmpty(_adminUsername) || string.IsNullOrEmpty(_adminPasswordHash))
            return Result<LoginResponse>.Fail("Admin credentials are not configured.");

        if (!request.Username.Equals(_adminUsername, StringComparison.OrdinalIgnoreCase))
            return Result<LoginResponse>.Fail("Invalid credentials.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, _adminPasswordHash))
            return Result<LoginResponse>.Fail("Invalid credentials.");

        return Result<LoginResponse>.Ok(new LoginResponse(GenerateJwt(request.Username)));
    }

    private string GenerateJwt(string username)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var token = new JwtSecurityToken(
            claims: [new Claim(ClaimTypes.Name, username), new Claim(ClaimTypes.Role, "Admin")],
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
