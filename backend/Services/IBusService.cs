using System;
using System.Collections.Generic;
using Backend.Models;

namespace Backend.Services
{
    public interface IBusService
    {
        List<BusTrip> GetAllTrips();
        List<BusTrip> SearchTrips(string? from, string? to, DateTime? date);
        BusTrip? GetTripById(string id);
        List<string> GetAvailableSeats(string tripId);
        BusBooking BookTicket(string tripId, string userId, string seatNumber, string passengerName, string passengerPhone, string? email = null);
        BusBooking ReserveTicket(string tripId, string userId, string seatNumber, string passengerName, string passengerPhone, string? email = null);
        bool ConfirmBooking(string bookingId);
        List<BusBooking> GetUserBookings(string userId);
        bool CancelBooking(string bookingId, string userId);
        List<BusTrip> GetTripsByLocation(string location);
    }
}