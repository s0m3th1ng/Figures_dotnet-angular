namespace Figures.Models.Auth;

public class AuthResult
{
    public string Error { get; set; }
    public bool Success { get; set; }
    public Token Token { get; set; }
}