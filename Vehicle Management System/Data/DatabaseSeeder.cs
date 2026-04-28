using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Models;

namespace Vehicle_Management_System.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (!context.Roles.Any())
        {
            context.Roles.AddRange(
                new Role { Id = 1, Name = "Admin" },
                new Role { Id = 2, Name = "Staff" },
                new Role { Id = 3, Name = "Customer" }
            );
            await context.SaveChangesAsync();
        }

        if (!context.Users.Any(u => u.Email == "admin@vehicleparts.com"))
        {
            context.Users.Add(new User
            {
                FullName = "System Admin",
                Email = "admin@vehicleparts.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Phone = "",
                RoleId = 1,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            });
            await context.SaveChangesAsync();
        }
    }
}
