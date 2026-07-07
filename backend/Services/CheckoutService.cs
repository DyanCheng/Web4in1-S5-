using Backend.Controllers;
using Backend.Models;

namespace Backend.Services;

public class CheckoutService
{
    private static readonly Dictionary<string, decimal> DiscountRates = new(StringComparer.OrdinalIgnoreCase)
    {
        ["SUMMER2026"] = 0.15m,
        ["WELCOME10"] = 0.10m,
        ["VIP20"] = 0.20m,
    };

    private readonly TourDbService _tourDb;
    private readonly IBusService _busService;
    private readonly PaymentDbService _paymentDb;
    private readonly SePayService _sePay;

    public CheckoutService(
        TourDbService tourDb,
        IBusService busService,
        PaymentDbService paymentDb,
        SePayService sePay)
    {
        _tourDb = tourDb;
        _busService = busService;
        _paymentDb = paymentDb;
        _sePay = sePay;
    }

    public async Task<CheckoutResult> CheckoutAsync(CheckoutRequest request)
    {
        if (request.Items == null || request.Items.Count == 0)
            throw new CheckoutException("Giỏ hàng trống");

        if (string.IsNullOrWhiteSpace(request.UserEmail))
            throw new CheckoutException("Email liên hệ không được để trống");

        var bookingRefs = new List<string>();
        var orderItems = new List<object>();
        decimal subtotal = 0;

        foreach (var item in request.Items)
        {
            var serviceType = NormalizeServiceType(item.ServiceType);
            var created = await CreatePendingBookingAsync(request, item, serviceType);
            bookingRefs.Add(created.BookingRef);
            orderItems.Add(created.OrderItem);
            subtotal += created.LineTotal;
        }

        var discountRate = GetDiscountRate(request.DiscountCode);
        var discountAmount = Math.Round(subtotal * discountRate, 0);
        var finalAmount = subtotal - discountAmount;

        if (finalAmount <= 0)
            throw new CheckoutException("Số tiền thanh toán không hợp lệ");

        long? userId = long.TryParse(request.UserId, out var parsedUserId) ? parsedUserId : null;
        var paymentCode = _sePay.GeneratePaymentCode();

        await _paymentDb.CreateOrderPaymentAsync(
            paymentCode,
            userId,
            request.UserEmail.Trim(),
            request.UserName,
            finalAmount,
            orderItems,
            bookingRefs);

        return new CheckoutResult
        {
            PaymentCode = paymentCode,
            Amount = finalAmount,
            Subtotal = subtotal,
            DiscountAmount = discountAmount,
            DiscountCode = discountRate > 0 ? request.DiscountCode?.Trim().ToUpperInvariant() : null,
            QrUrl = _sePay.BuildQrUrl(paymentCode, finalAmount),
            BookingRefs = bookingRefs,
            OrderItems = orderItems,
        };
    }

    public async Task ConfirmBookingsAsync(IEnumerable<string> bookingRefs)
    {
        foreach (var bookingRef in bookingRefs)
        {
            if (string.IsNullOrWhiteSpace(bookingRef))
                continue;

            if (bookingRef.StartsWith("ORD-", StringComparison.OrdinalIgnoreCase))
            {
                await _tourDb.ConfirmBookingAsync(bookingRef);
                continue;
            }

            if (bookingRef.StartsWith("BB-", StringComparison.OrdinalIgnoreCase))
            {
                _busService.ConfirmBooking(bookingRef);
            }
        }
    }

    private async Task<PendingBookingResult> CreatePendingBookingAsync(
        CheckoutRequest request,
        CheckoutItemRequest item,
        string serviceType)
    {
        return serviceType switch
        {
            "bus" => CreateBusBooking(request, item),
            "flight" or "insurance" or "vehicle" => CreateServiceBooking(request, item, serviceType),
            _ => await CreateTourBookingAsync(request, item),
        };
    }

    private async Task<PendingBookingResult> CreateTourBookingAsync(
        CheckoutRequest request,
        CheckoutItemRequest item)
    {
        var booking = await _tourDb.CreateBookingAsync(new BookingRequest
        {
            TourId = item.ReferenceId,
            UserId = request.UserId,
            UserEmail = request.UserEmail,
            Date = item.Date,
            Guests = item.Guests,
            Quantity = item.Quantity,
            TourTitle = item.Title,
            TourImage = item.Image,
        });

        if (booking == null)
            throw new CheckoutException($"Không thể đặt tour: {item.Title}");

        return new PendingBookingResult
        {
            BookingRef = booking.Id,
            LineTotal = booking.Total,
            OrderItem = BuildOrderItem("tour", item, booking.Id, booking.Total),
        };
    }

    private PendingBookingResult CreateBusBooking(CheckoutRequest request, CheckoutItemRequest item)
    {
        var seatNumber = string.IsNullOrWhiteSpace(item.Metadata?.SeatNumber)
            ? _busService.GetAvailableSeats(item.ReferenceId).FirstOrDefault() ?? "A01"
            : item.Metadata!.SeatNumber!;

        var booking = _busService.ReserveTicket(
            item.ReferenceId,
            request.UserId,
            seatNumber,
            request.UserName,
            request.Phone,
            request.UserEmail);

        return new PendingBookingResult
        {
            BookingRef = booking.Id,
            LineTotal = booking.TotalPrice,
            OrderItem = BuildOrderItem("bus", item, booking.Id, booking.TotalPrice, new
            {
                seatNumber,
                route = item.Metadata?.Route,
            }),
        };
    }

    private static PendingBookingResult CreateServiceBooking(
        CheckoutRequest request,
        CheckoutItemRequest item,
        string serviceType)
    {
        var lineTotal = CalculateLineTotal(item, serviceType);
        var bookingRef = $"{serviceType.ToUpperInvariant()[..3]}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";

        object? extra = serviceType switch
        {
            "flight" => new { seat = item.Metadata?.SeatNumber ?? ExtractFlightSeat(item.ReferenceId) },
            "vehicle" => new { pickupDate = item.Date, seats = item.Guests },
            _ => null,
        };

        return new PendingBookingResult
        {
            BookingRef = bookingRef,
            LineTotal = lineTotal,
            OrderItem = BuildOrderItem(serviceType, item, bookingRef, lineTotal, extra),
        };
    }

    private static object BuildOrderItem(
        string serviceType,
        CheckoutItemRequest item,
        string bookingRef,
        decimal lineTotal,
        object? extra = null)
    {
        return new
        {
            serviceType,
            referenceId = item.ReferenceId,
            bookingRef,
            title = item.Title,
            image = item.Image,
            price = item.Price,
            quantity = item.Quantity,
            guests = item.Guests,
            date = item.Date,
            lineTotal,
            extra,
        };
    }

    private static decimal CalculateLineTotal(CheckoutItemRequest item, string serviceType)
    {
        return serviceType switch
        {
            "flight" or "insurance" or "vehicle" or "bus" => item.Price * item.Quantity,
            _ => item.Price * item.Quantity * Math.Max(item.Guests, 1),
        };
    }

    private static string NormalizeServiceType(string? serviceType) =>
        (serviceType ?? "tour").Trim().ToLowerInvariant();

    private static decimal GetDiscountRate(string? discountCode)
    {
        if (string.IsNullOrWhiteSpace(discountCode))
            return 0;

        return DiscountRates.TryGetValue(discountCode.Trim(), out var rate) ? rate : 0;
    }

    private static string? ExtractFlightSeat(string referenceId)
    {
        var dashIndex = referenceId.LastIndexOf('-');
        return dashIndex >= 0 && dashIndex < referenceId.Length - 1
            ? referenceId[(dashIndex + 1)..]
            : null;
    }

    private sealed class PendingBookingResult
    {
        public required string BookingRef { get; init; }
        public required decimal LineTotal { get; init; }
        public required object OrderItem { get; init; }
    }
}

public class CheckoutRequest
{
    public string UserId { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? DiscountCode { get; set; }
    public List<CheckoutItemRequest> Items { get; set; } = new();
}

public class CheckoutItemRequest
{
    public string ServiceType { get; set; } = "tour";
    public string ReferenceId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; } = 1;
    public int Guests { get; set; } = 1;
    public string Date { get; set; } = string.Empty;
    public CheckoutItemMetadata? Metadata { get; set; }
}

public class CheckoutItemMetadata
{
    public string? SeatNumber { get; set; }
    public string? Route { get; set; }
}

public class CheckoutResult
{
    public required string PaymentCode { get; init; }
    public required decimal Amount { get; init; }
    public required decimal Subtotal { get; init; }
    public required decimal DiscountAmount { get; init; }
    public string? DiscountCode { get; init; }
    public required string QrUrl { get; init; }
    public required List<string> BookingRefs { get; init; }
    public required List<object> OrderItems { get; init; }
}

public class CheckoutException : Exception
{
    public CheckoutException(string message) : base(message) { }
}
