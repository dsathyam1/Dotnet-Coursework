using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Vehicle_Management_System.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// Application services
builder.Services.AddScoped<Vehicle_Management_System.Helpers.JwtHelper>();
builder.Services.AddScoped<Vehicle_Management_System.Services.Interfaces.IAuthService,
                           Vehicle_Management_System.Services.AuthService>();
builder.Services.AddScoped<Vehicle_Management_System.Services.Interfaces.IStaffService,
                           Vehicle_Management_System.Services.StaffService>();
builder.Services.AddScoped<Vehicle_Management_System.Services.Interfaces.IVendorService,
                           Vehicle_Management_System.Services.VendorService>();
builder.Services.AddScoped<Vehicle_Management_System.Services.Interfaces.IPartService,
                           Vehicle_Management_System.Services.PartService>();
builder.Services.AddScoped<Vehicle_Management_System.Services.Interfaces.IPurchaseInvoiceService,
                           Vehicle_Management_System.Services.PurchaseInvoiceService>();
builder.Services.AddScoped<Vehicle_Management_System.Services.Interfaces.ICustomerService,
                           Vehicle_Management_System.Services.CustomerService>();
builder.Services.AddScoped<Vehicle_Management_System.Services.Interfaces.ISalesInvoiceService,
                           Vehicle_Management_System.Services.SalesInvoiceService>();
builder.Services.AddScoped<Vehicle_Management_System.Services.Interfaces.IReportService,
                           Vehicle_Management_System.Services.ReportService>();
builder.Services.AddScoped<Vehicle_Management_System.Services.Interfaces.IEmailService,
                           Vehicle_Management_System.Services.EmailService>();
builder.Services.AddScoped<Vehicle_Management_System.Services.Interfaces.INotificationService,
                           Vehicle_Management_System.Services.NotificationService>();
builder.Services.AddHostedService<Vehicle_Management_System.Services.CreditReminderBackgroundService>();
builder.Services.AddScoped<Vehicle_Management_System.Services.Interfaces.IAppointmentService,
                           Vehicle_Management_System.Services.AppointmentService>();
builder.Services.AddScoped<Vehicle_Management_System.Services.Interfaces.IPartRequestService,
                           Vehicle_Management_System.Services.PartRequestService>();
builder.Services.AddScoped<Vehicle_Management_System.Services.Interfaces.IReviewService,
                           Vehicle_Management_System.Services.ReviewService>();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secret = jwtSettings["Secret"] ?? throw new InvalidOperationException("JwtSettings:Secret is not configured.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Vehicle Management System API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter JWT Bearer token only",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer"
    });

    options.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer"),
            new List<string>()
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    await context.Database.MigrateAsync();
    await DatabaseSeeder.SeedAsync(context);
}


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
