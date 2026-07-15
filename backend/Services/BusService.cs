using System;
using System.Collections.Generic;
using System.Linq;
using Backend.Models;

namespace Backend.Services
{
    public class BusService : IBusService
    {
        private readonly DataStoreService _dataStore;

        public BusService(DataStoreService dataStore)
        {
            _dataStore = dataStore;
        }

        public List<BusTrip> GetAllTrips()
        {
            return _dataStore.BusTrips?.Where(t => t.IsActive).ToList() ?? new List<BusTrip>();
        }

        public List<BusTrip> SearchTrips(string? from, string? to, DateTime? date)
        {
            var query = _dataStore.BusTrips?.Where(t => t.IsActive).AsQueryable() ?? new List<BusTrip>().AsQueryable();

            if (!string.IsNullOrEmpty(from))
            {
                query = query.Where(t => t.DeparturePoint.Contains(from, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrEmpty(to))
            {
                query = query.Where(t => t.ArrivalPoint.Contains(to, StringComparison.OrdinalIgnoreCase));
            }

            if (date.HasValue)
            {
                query = query.Where(t => t.DepartureTime.Date == date.Value.Date);
            }

            query = query.Where(t => t.AvailableSeats > 0);

            return query.OrderBy(t => t.DepartureTime).ToList();
        }

        public BusTrip? GetTripById(string id)
        {
            return _dataStore.BusTrips?.FirstOrDefault(t => t.Id == id && t.IsActive);
        }

        public List<string> GetAvailableSeats(string tripId)
        {
            var trip = GetTripById(tripId);
            if (trip == null) return new List<string>();

            var bookedSeats = _dataStore.BusBookings?
                .Where(b => b.BusTripId == tripId && b.Status != "cancelled")
                .Select(b => b.SeatNumber)
                .ToList() ?? new List<string>();

            var allSeats = new List<string>();
            for (int i = 1; i <= trip.TotalSeats; i++)
            {
                var row = (char)('A' + (i - 1) / 10);
                var col = (i - 1) % 10 + 1;
                allSeats.Add($"{row}{col:D2}");
            }

            return allSeats.Except(bookedSeats).ToList();
        }

        public BusBooking BookTicket(string tripId, string userId, string seatNumber, string passengerName, string passengerPhone, string? email = null)
        {
            var booking = ReserveTicket(tripId, userId, seatNumber, passengerName, passengerPhone, email);
            ConfirmBooking(booking.Id);
            return booking;
        }

        public BusBooking ReserveTicket(string tripId, string userId, string seatNumber, string passengerName, string passengerPhone, string? email = null)
        {
            var trip = GetTripById(tripId);
            if (trip == null)
                throw new Exception("Chuyến xe không tồn tại");

            if (trip.AvailableSeats <= 0)
                throw new Exception("Chuyến xe đã hết ghế");

            var existingBooking = _dataStore.BusBookings?
                .FirstOrDefault(b => b.BusTripId == tripId && b.SeatNumber == seatNumber && b.Status != "cancelled");

            if (existingBooking != null)
                throw new Exception($"Ghế {seatNumber} đã được đặt");

            var booking = new BusBooking
            {
                Id = $"BB-{DateTime.UtcNow:yyyyMMddHHmmss}{Random.Shared.Next(1000, 9999)}",
                BusTripId = tripId,
                UserId = userId,
                SeatNumber = seatNumber,
                TotalPrice = trip.Price,
                BookingDate = DateTime.Now,
                Status = "pending",
                PassengerName = passengerName,
                PassengerPhone = passengerPhone,
                PassengerEmail = email
            };

            _dataStore.BusBookings?.Add(booking);
            return booking;
        }

        public bool ConfirmBooking(string bookingId)
        {
            var booking = _dataStore.BusBookings?.FirstOrDefault(b => b.Id == bookingId);
            if (booking == null || booking.Status == "confirmed")
                return booking != null;

            if (booking.Status == "cancelled")
                return false;

            var trip = GetTripById(booking.BusTripId);
            if (trip == null)
                return false;

            if (trip.AvailableSeats <= 0)
                return false;

            booking.Status = "confirmed";
            trip.AvailableSeats -= 1;
            return true;
        }

        public List<BusBooking> GetUserBookings(string userId)
        {
            return _dataStore.BusBookings?
                .Where(b => b.UserId == userId && b.Status != "cancelled")
                .OrderByDescending(b => b.BookingDate)
                .ToList() ?? new List<BusBooking>();
        }

        public bool CancelBooking(string bookingId, string userId)
        {
            var booking = _dataStore.BusBookings?.FirstOrDefault(b => b.Id == bookingId && b.UserId == userId);
            if (booking == null || booking.Status == "cancelled")
                return false;

            var trip = GetTripById(booking.BusTripId);
            if (trip != null && trip.DepartureTime < DateTime.Now.AddHours(2))
                throw new Exception("Không thể hủy vé trong vòng 2 giờ trước khi khởi hành");

            var wasConfirmed = booking.Status == "confirmed";
            booking.Status = "cancelled";
            
            if (trip != null && wasConfirmed)
                trip.AvailableSeats += 1;

            return true;
        }

        public List<BusTrip> GetTripsByLocation(string location)
        {
            return _dataStore.BusTrips?
                .Where(t => t.IsActive && 
                    (t.DeparturePoint.Contains(location, StringComparison.OrdinalIgnoreCase) ||
                     t.ArrivalPoint.Contains(location, StringComparison.OrdinalIgnoreCase)))
                .ToList() ?? new List<BusTrip>();
        }
    }
}