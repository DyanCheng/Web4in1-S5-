namespace Backend.Models;

public class Discount
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Code { get; set; } = string.Empty;

    public int Percentage { get; set; }

    public bool IsActive { get; set; } = true;
}