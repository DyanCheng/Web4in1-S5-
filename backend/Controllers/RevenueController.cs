using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RevenueController : ControllerBase
    {
        private readonly RevenueService _revenueService;

        public RevenueController(RevenueService revenueService)
        {
            _revenueService = revenueService;
        }

        [HttpGet("monthly")]
        public async Task<IActionResult> GetMonthlyRevenue()
        {
            try
            {
                var result = await _revenueService.GetMonthlyRevenueAsync();
                return Ok(new
                {
                    success = true,
                    message = "Thống kê doanh thu theo tháng thành công",
                    data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Không thể thống kê doanh thu theo tháng",
                    error = ex.Message
                });
            }
        }

        [HttpGet("range")]
        public async Task<IActionResult> GetRevenueByRange([FromQuery] string? startDate, [FromQuery] string? endDate)
        {
            if (string.IsNullOrWhiteSpace(startDate) || string.IsNullOrWhiteSpace(endDate))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Vui lòng cung cấp startDate và endDate"
                });
            }

            if (!DateTime.TryParseExact(startDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsedStart)
                || !DateTime.TryParseExact(endDate, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var parsedEnd))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Định dạng ngày không hợp lệ. Vui lòng dùng yyyy-MM-dd"
                });
            }

            try
            {
                var result = await _revenueService.GetRevenueByRangeAsync(parsedStart, parsedEnd);
                return Ok(new
                {
                    success = true,
                    message = "Thống kê doanh thu theo khoảng thời gian thành công",
                    data = result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Không thể thống kê doanh thu theo khoảng thời gian",
                    error = ex.Message
                });
            }
        }
    }
}
