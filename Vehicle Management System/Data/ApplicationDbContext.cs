using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Models;

namespace Vehicle_Management_System.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // DbSets
    public DbSet<Role> Roles { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Staff> Staff { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Vendor> Vendors { get; set; }
    public DbSet<Part> Parts { get; set; }
    public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
    public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; }
    public DbSet<SalesInvoice> SalesInvoices { get; set; }
    public DbSet<SalesInvoiceItem> SalesInvoiceItems { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<PartRequest> PartRequests { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Role ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Name).IsRequired().HasMaxLength(50);
        });

        // ── User ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(100);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.Phone).HasMaxLength(20);
            entity.Property(u => u.IsActive).HasDefaultValue(true);

            // User → Role (many-to-one)
            entity.HasOne(u => u.Role)
                  .WithMany(r => r.Users)
                  .HasForeignKey(u => u.RoleId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Staff ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.EmployeeCode).HasMaxLength(20);
            entity.Property(s => s.Department).HasMaxLength(50);

            // Staff → User (one-to-one)
            entity.HasOne(s => s.User)
                  .WithOne(u => u.Staff)
                  .HasForeignKey<Staff>(s => s.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Customer ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.TotalSpent).HasColumnType("numeric(18,2)").HasDefaultValue(0m);
            entity.Property(c => c.CreditBalance).HasColumnType("numeric(18,2)").HasDefaultValue(0m);

            // Customer → User (one-to-one)
            entity.HasOne(c => c.User)
                  .WithOne(u => u.Customer)
                  .HasForeignKey<Customer>(c => c.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Vehicle ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(v => v.Id);
            entity.Property(v => v.Make).HasMaxLength(50);
            entity.Property(v => v.Model).HasMaxLength(50);
            entity.Property(v => v.NumberPlate).HasMaxLength(20);

            // Vehicle → Customer (many-to-one)
            entity.HasOne(v => v.Customer)
                  .WithMany(c => c.Vehicles)
                  .HasForeignKey(v => v.CustomerId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Vendor ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Vendor>(entity =>
        {
            entity.HasKey(v => v.Id);
            entity.Property(v => v.Name).IsRequired().HasMaxLength(100);
            entity.Property(v => v.ContactPerson).HasMaxLength(100);
            entity.Property(v => v.Phone).HasMaxLength(20);
            entity.Property(v => v.Email).HasMaxLength(100);
            entity.Property(v => v.Address).HasMaxLength(200);
        });

        // ── Part ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<Part>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(100);
            entity.Property(p => p.Description).HasMaxLength(500);
            entity.Property(p => p.Category).HasMaxLength(50);
            entity.Property(p => p.SellingPrice).HasColumnType("numeric(18,2)");
            entity.Property(p => p.CostPrice).HasColumnType("numeric(18,2)");

            // Part → Vendor (many-to-one)
            entity.HasOne(p => p.Vendor)
                  .WithMany(v => v.Parts)
                  .HasForeignKey(p => p.VendorId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── PurchaseInvoice ───────────────────────────────────────────────────
        modelBuilder.Entity<PurchaseInvoice>(entity =>
        {
            entity.HasKey(pi => pi.Id);
            entity.Property(pi => pi.TotalAmount).HasColumnType("numeric(18,2)");

            // PurchaseInvoice → Vendor (many-to-one)
            entity.HasOne(pi => pi.Vendor)
                  .WithMany(v => v.PurchaseInvoices)
                  .HasForeignKey(pi => pi.VendorId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── PurchaseInvoiceItem ───────────────────────────────────────────────
        modelBuilder.Entity<PurchaseInvoiceItem>(entity =>
        {
            entity.HasKey(pii => pii.Id);
            entity.Property(pii => pii.UnitCostPrice).HasColumnType("numeric(18,2)");

            // PurchaseInvoiceItem → PurchaseInvoice (many-to-one)
            entity.HasOne(pii => pii.PurchaseInvoice)
                  .WithMany(pi => pi.PurchaseInvoiceItems)
                  .HasForeignKey(pii => pii.PurchaseInvoiceId)
                  .OnDelete(DeleteBehavior.Cascade);

            // PurchaseInvoiceItem → Part (many-to-one)
            entity.HasOne(pii => pii.Part)
                  .WithMany(p => p.PurchaseInvoiceItems)
                  .HasForeignKey(pii => pii.PartId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── SalesInvoice ──────────────────────────────────────────────────────
        modelBuilder.Entity<SalesInvoice>(entity =>
        {
            entity.HasKey(si => si.Id);
            entity.Property(si => si.TotalAmount).HasColumnType("numeric(18,2)");

            // SalesInvoice → Customer (many-to-one)
            entity.HasOne(si => si.Customer)
                  .WithMany(c => c.SalesInvoices)
                  .HasForeignKey(si => si.CustomerId)
                  .OnDelete(DeleteBehavior.Restrict);

            // SalesInvoice → Staff (many-to-one)
            entity.HasOne(si => si.Staff)
                  .WithMany(s => s.SalesInvoices)
                  .HasForeignKey(si => si.StaffId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── SalesInvoiceItem ──────────────────────────────────────────────────
        modelBuilder.Entity<SalesInvoiceItem>(entity =>
        {
            entity.HasKey(sii => sii.Id);
            entity.Property(sii => sii.UnitSellingPrice).HasColumnType("numeric(18,2)");

            // SalesInvoiceItem → SalesInvoice (many-to-one)
            entity.HasOne(sii => sii.SalesInvoice)
                  .WithMany(si => si.SalesInvoiceItems)
                  .HasForeignKey(sii => sii.SalesInvoiceId)
                  .OnDelete(DeleteBehavior.Cascade);

            // SalesInvoiceItem → Part (many-to-one)
            entity.HasOne(sii => sii.Part)
                  .WithMany(p => p.SalesInvoiceItems)
                  .HasForeignKey(sii => sii.PartId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Appointment ───────────────────────────────────────────────────────
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.ServiceType).HasMaxLength(100);
            entity.Property(a => a.Status).HasMaxLength(20).HasDefaultValue("Pending");
            entity.Property(a => a.Notes).HasMaxLength(500);

            // Appointment → Customer (many-to-one)
            entity.HasOne(a => a.Customer)
                  .WithMany(c => c.Appointments)
                  .HasForeignKey(a => a.CustomerId)
                  .OnDelete(DeleteBehavior.Restrict);

            // Appointment → Vehicle (many-to-one)
            entity.HasOne(a => a.Vehicle)
                  .WithMany(v => v.Appointments)
                  .HasForeignKey(a => a.VehicleId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── PartRequest ───────────────────────────────────────────────────────
        modelBuilder.Entity<PartRequest>(entity =>
        {
            entity.HasKey(pr => pr.Id);
            entity.Property(pr => pr.PartName).HasMaxLength(100);
            entity.Property(pr => pr.Description).HasMaxLength(500);
            entity.Property(pr => pr.Status).HasMaxLength(20).HasDefaultValue("Pending");

            // PartRequest → Customer (many-to-one)
            entity.HasOne(pr => pr.Customer)
                  .WithMany(c => c.PartRequests)
                  .HasForeignKey(pr => pr.CustomerId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Review ────────────────────────────────────────────────────────────
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Comment).HasMaxLength(1000);

            // Review → Customer (many-to-one)
            entity.HasOne(r => r.Customer)
                  .WithMany(c => c.Reviews)
                  .HasForeignKey(r => r.CustomerId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Notification ──────────────────────────────────────────────────────
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(n => n.Id);
            entity.Property(n => n.Message).HasMaxLength(500);
            entity.Property(n => n.IsRead).HasDefaultValue(false);
            entity.Property(n => n.Type).HasMaxLength(50);

            // Notification → User (many-to-one)
            entity.HasOne(n => n.User)
                  .WithMany(u => u.Notifications)
                  .HasForeignKey(n => n.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
