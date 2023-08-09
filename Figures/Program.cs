using System;
using System.Text;
using Figures.Models;
using Figures.Models.Auth;
using Figures.Repos;
using Figures.Services;
using Figures.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;

var config = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json", optional: false)
    .Build();

var clientUrl = config.GetSection("ApplicationUrl").GetSection("client").Value;
var jwtOptions = config.GetSection("JwtSettings");
var connectionString = config.GetConnectionString("DefaultConnection");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllersWithViews();

builder.Services.AddDbContext<ApplicationContext>(options =>
    {
        options.UseSqlServer(connectionString);
    }
);

builder.Services.AddIdentity<IdentityUser, IdentityRole>().AddEntityFrameworkStores<ApplicationContext>();

var accessKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions["Key"]));
var refreshKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions["RefreshKey"]));

builder.Services.Configure<JwtOptions>(options =>
{
    int.TryParse(jwtOptions["AccessExpire"], out var accessExpireDays);
    if (accessExpireDays > 0)
    {
        options.AccessValidFor = TimeSpan.FromSeconds(30);
    }
    options.Issuer = jwtOptions["Issuer"];
    options.Audience = jwtOptions["Audience"];
    options.AccessSecret = Encoding.UTF8.GetBytes(jwtOptions["Key"]);
    options.RefreshSecret = Encoding.UTF8.GetBytes(jwtOptions["RefreshKey"]);
    options.AccessSigningCredentials = new SigningCredentials(accessKey, SecurityAlgorithms.HmacSha256);
    options.RefreshCredentials = new SigningCredentials(refreshKey, SecurityAlgorithms.HmacSha256);
});

builder.Services.AddAuthentication(opt => {
        opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions["Issuer"],
            ValidAudience = jwtOptions["Audience"],
            IssuerSigningKey = accessKey
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AppPolicy", options =>
    {
        options
            .AllowAnyHeader()
            .AllowCredentials()
            .AllowAnyMethod()
            .WithOrigins(clientUrl);
    });
});

builder.Services.AddScoped(typeof(UnitOfWork));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddSingleton<JwtService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCors("AppPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");;

app.Run();
