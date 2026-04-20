using System.Text.Json.Serialization;

namespace Vehicle_Management_System.DTOs.Vehicle;

/// <summary>
/// Returned to the frontend. NumberPlate is serialized as "licensePlate"
/// so the frontend receives the field name it expects.
/// </summary>
public class VehicleResponseDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string? Make { get; set; }
    public string? Model { get; set; }
    public int Year { get; set; }

    [JsonPropertyName("licensePlate")]
    public string? NumberPlate { get; set; }

    public int Mileage { get; set; }
    public DateTime? LastServiceDate { get; set; }
}
