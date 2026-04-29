using System.ComponentModel.DataAnnotations;

namespace Vehicle_Management_System.Models;

public class Role
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    // Navigation
    public ICollection<User> Users { get; set; } = new List<User>();
}
