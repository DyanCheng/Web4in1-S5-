using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;

    public CouponsController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet]
    public async Task<IActionResult> ListActive()
    {
        try
        {
            var coupons = await ListActiveCouponsAsync();
            return Ok(coupons);
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private async Task<object> ListActiveCouponsAsync()
    {
        var supabaseUrl = FirstConfig(_configuration, "SUPABASE_URL", "Supabase:Url");
        var supabaseKey = FirstConfig(
            _configuration,
            "SUPABASE_SERVICE_ROLE_KEY",
            "SUPABASE_KEY",
            "Supabase:Key");

        if (string.IsNullOrWhiteSpace(supabaseUrl) || string.IsNullOrWhiteSpace(supabaseKey))
            throw new InvalidOperationException("Configure SUPABASE_URL + SUPABASE_KEY.");

        var http = _httpClientFactory.CreateClient("Supabase");
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"{supabaseUrl.TrimEnd('/')}/rest/v1/rpc/list_active_coupons")
        {
            Content = JsonContent.Create(new { })
        };
        request.Headers.Add("apikey", supabaseKey);
        request.Headers.Add("Authorization", $"Bearer {supabaseKey}");

        var response = await http.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
            throw new Exception(content);

        if (string.IsNullOrWhiteSpace(content) || content == "null")
            return Array.Empty<object>();

        return JsonSerializer.Deserialize<object>(content) ?? Array.Empty<object>();
    }

    private static string? FirstConfig(IConfiguration configuration, params string[] keys)
    {
        foreach (var key in keys)
        {
            var value = configuration[key]?.Trim();
            if (!string.IsNullOrWhiteSpace(value))
                return value;
        }
        return null;
    }
}
