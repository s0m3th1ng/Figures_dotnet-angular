using System.Threading.Tasks;
using Figures.Models.Auth;

namespace Figures.Services.Interfaces;

public interface IAuthService
{
    public Task<AuthResult> Login(LoginViewModel loginViewModel);
    public Task<AuthResult> SignUp(LoginViewModel signUpViewModel);
    public AuthResult RefreshToken(string token);
}