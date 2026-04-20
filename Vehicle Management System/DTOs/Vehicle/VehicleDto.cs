using System.Text.Json.Serialization;

namespace Vehicle_Management_System.DTOs.Vehicle;

/// <summary>
/// Used for creating/updating a vehicle.
/// The frontend sends "licensePlate" (camelCase), which is mapped
/// to the C# property NumberPlate via JsonPropertyName.
/// </summary>
public class VehicleDto
{
    public string? Make { get; set; }
    public string? Model { get; set; }
    public int Year { get; set; }

    /// <summary>
    /// Frontend sends this field as "licensePlate".
    /// The DB column is "NumberPlate".
    /// </summary>
    [JsonPropertyName("licensePlate")]
    public string? NumberPlate { get; set; }

    public int Mileage { get; set; }
    public DateTime? LastServiceDate { get; set; }
}
