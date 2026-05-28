namespace Backend.Models
{
    public class User
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = "user"; // "user", "admin", "hotel_owner"
        public string Password { get; set; } = string.Empty;
    }
}
