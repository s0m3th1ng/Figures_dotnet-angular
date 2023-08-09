using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Figures.Models.Auth;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Figures.Services;

public class JwtService
{
    public JwtService(IOptions<JwtOptions> options)
    {
        _jwtOptions = options.Value;
    }

    private readonly JwtOptions _jwtOptions;
    
    public Token GenerateToken(List<Claim> claims)
    {
        var token = new Token
        {
            AccessToken = CreateToken(claims, _jwtOptions.AccessExpiration, _jwtOptions.AccessSigningCredentials),
            RefreshToken = CreateToken(claims, _jwtOptions.RefreshExpiration, _jwtOptions.RefreshCredentials)
        };

        return token;
    }

    private string CreateToken(IEnumerable<Claim> user, DateTime expirationTime, SigningCredentials credentials)
    {
        var jwt = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: user,
            expires: expirationTime,
            signingCredentials: credentials);

        var encodedJwt = new JwtSecurityTokenHandler().WriteToken(jwt);

        return encodedJwt;
    }
}