using Portfolio.Common;
using Portfolio.DTOs.Auth;

namespace Portfolio.Services;

public interface IAuthService
{
    Result<LoginResponse> Login(LoginRequest request);
}
