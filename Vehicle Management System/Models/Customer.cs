namespace Vehicle_Management_System.Models;

public class Customer
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public decimal TotalSpent { get; set; } = 0m;

    public decimal CreditBalance { get; set; } = 0m;

    public DateTime? LastCreditPaidAt { get; set; }

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public ICollection<SalesInvoice> SalesInvoices { get; set; } = new List<SalesInvoice>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<PartRequest> PartRequests { get; set; } = new List<PartRequest>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
