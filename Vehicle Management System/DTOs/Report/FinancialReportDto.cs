namespace Vehicle_Management_System.DTOs.Report;

public class FinancialReportDto
{
    public string Period { get; set; } = string.Empty;
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalCost { get; set; }
    public decimal Profit { get; set; }
    public int TransactionCount { get; set; }
    public List<TopSellingPartDto> TopSellingParts { get; set; } = new();
}

public class TopSellingPartDto
{
    public int PartId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public int TotalQuantitySold { get; set; }
    public decimal TotalRevenue { get; set; }
}
