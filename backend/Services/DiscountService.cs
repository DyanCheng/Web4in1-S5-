using Backend.Models;

namespace Backend.Services;

public class DiscountService
{
    private readonly List<Discount> _discounts = new()
    {
        new Discount
        {
            Code = "WELCOME10",
            Percentage = 10
        },
        new Discount
        {
            Code = "SUMMER20",
            Percentage = 20
        }
    };

    public List<Discount> GetAll()
    {
        return _discounts;
    }

    public Discount? GetByCode(string code)
    {
        return _discounts.FirstOrDefault(x =>
            x.Code.Equals(code, StringComparison.OrdinalIgnoreCase));
    }

    public void Add(Discount discount)
    {
        _discounts.Add(discount);
    }

    public bool Delete(Guid id)
    {
        var discount = _discounts.FirstOrDefault(x => x.Id == id);

        if (discount == null)
            return false;

        _discounts.Remove(discount);
        return true;
    }
}