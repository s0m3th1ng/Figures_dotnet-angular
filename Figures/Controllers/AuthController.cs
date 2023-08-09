using System.Threading.Tasks;
using Figures.Models.Auth;
using Figures.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Figures.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginViewModel user)
    {
        if (user is null)
        {
            return BadRequest("Invalid client request");
        }

        var result = await _authService.Login(user);
        if (result.Success)
        {
            return Ok(result.Token);
        }
        return Unauthorized(result.Error);
    }
    
    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] LoginViewModel credentials)
    {
        var result = await _authService.SignUp(credentials);
        if (!result.Success)
        {
            return BadRequest(result.Error);
        }
        return await Login(credentials);
    }
    
    [HttpPost("refresh")]
    public IActionResult RefreshToken(Token token)
    {
        if (token is null)
        {
            return BadRequest("Invalid client request");
        }

        var refreshed = _authService.RefreshToken(token.RefreshToken);
        if (!refreshed.Success)
        {
            return Ok();
        }
        return Ok(refreshed.Token);
    }
}