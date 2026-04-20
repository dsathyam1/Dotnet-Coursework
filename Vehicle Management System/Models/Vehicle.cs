using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.Models;

public class Vehicle
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    [MaxLength(50)]
    public string? Make { get; set; }

    [MaxLength(50)]
    public string? Model { get; set; }

    public int Year { get; set; }

    [MaxLength(20)]
    public string? NumberPlate { get; set; }

    public int Mileage { get; set; }

    public DateTime? LastServiceDate { get; set; }

    // Navigation
    public Customer Customer { get; set; } = null!;
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
