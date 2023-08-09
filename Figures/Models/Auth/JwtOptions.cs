using System;
using Microsoft.IdentityModel.Tokens;

namespace Figures.Models.Auth;

public class JwtOptions
{
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public byte[] AccessSecret { get; set; }
    public byte[] RefreshSecret { get; set; }
    public DateTime IssuedAt => DateTime.UtcNow;
    public TimeSpan AccessValidFor { get; set; } = TimeSpan.FromSeconds(30);
    public TimeSpan RefreshValidFor { get; set; } = TimeSpan.FromDays(90);
    public DateTime AccessExpiration => IssuedAt.Add(AccessValidFor);
    public DateTime RefreshExpiration => IssuedAt.Add(RefreshValidFor);
    public SigningCredentials AccessSigningCredentials { get; set; }
    public SigningCredentials RefreshCredentials { get; set; }
}