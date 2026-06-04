using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DiscountsController : ControllerBase
{
    private readonly DiscountService _service;

    public DiscountsController(DiscountService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_service.GetAll());
    }

    [HttpPost]
    public IActionResult Create([FromBody] Discount discount)
    {
        _service.Add(discount);

        return Ok(discount);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(Guid id)
    {
        var result = _service.Delete(id);

        if (!result)
            return NotFound();

        return NoContent();
    }
}