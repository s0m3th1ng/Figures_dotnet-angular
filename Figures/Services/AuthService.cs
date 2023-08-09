using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Figures.Models.Auth;
using Figures.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Figures.Services;

public class AuthService : IAuthService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly JwtService _jwtService;
        private readonly JwtOptions _jwtOptions;

        public AuthService(
            UserManager<IdentityUser> userManager,
            JwtService jwtService,
            IOptions<JwtOptions> jwtOptions)
        {
            _userManager = userManager;
            _jwtService = jwtService;
            _jwtOptions = jwtOptions.Value;
        }

        public async Task<AuthResult> Login(LoginViewModel loginViewModel)
        {
            var user = await _userManager.FindByEmailAsync(loginViewModel.UserName);
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginViewModel.Password))
            {
                return new AuthResult()
                {
                    Success = false,
                    Error = "User not found"
                };
            }

            var token = _jwtService.GenerateToken(new List<Claim>()
            {
                new(ClaimTypes.Name, user.UserName),
                new(ClaimTypes.NameIdentifier, user.Id)
            });
            return new AuthResult()
            {
                Token = token,
                Success = true
            };
        }

        public async Task<AuthResult> SignUp(LoginViewModel signUpViewModel)
        {
            var exists = await _userManager.FindByEmailAsync(signUpViewModel.UserName);
            if (exists != null)
            {
                return new AuthResult { Error = "User already exists", Success = false };
            }
            var user = new IdentityUser()
            {
                Email = signUpViewModel.UserName,
                UserName = signUpViewModel.UserName,
                SecurityStamp = Guid.NewGuid().ToString()
            };
            var result = await _userManager.CreateAsync(user, signUpViewModel.Password);
            if (!result.Succeeded)
            {
                return new AuthResult {
                    Error = result.Errors.FirstOrDefault()?.Description ?? "Internal server error",
                    Success = false
                };
            }

            return new AuthResult
            {
                Success = true
            };
        }

        public AuthResult RefreshToken(string token)
        {
            var claims = GetClaims(token, isAccessToken: false);
            if (claims == null)
            {
                return new AuthResult()
                {
                    Success = false
                };
            }

            return new AuthResult()
            {
                Success = true,
                Token = _jwtService.GenerateToken(claims.Claims.ToList())
            };
        }

        private ClaimsPrincipal GetClaims(string token, bool isAccessToken = true)
        {
            var key = new SymmetricSecurityKey(isAccessToken ? _jwtOptions.AccessSecret : _jwtOptions.RefreshSecret);

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidIssuer = _jwtOptions.Issuer,
                ValidAudience = _jwtOptions.Audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                RequireExpirationTime = true,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            ClaimsPrincipal claims;
            SecurityToken securityToken;
            try
            {
                claims = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);
            } catch (SecurityTokenExpiredException)
            {
                return null;
            }

            var jwtSecurityToken = securityToken as JwtSecurityToken;
            if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                    StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token");
            }

            return claims;
        }
    }