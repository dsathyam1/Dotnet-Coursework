using AutoMapper;
using Vehicle_Management_System.DTOs.Appointment;
using Vehicle_Management_System.DTOs.Auth;
using Vehicle_Management_System.DTOs.Customer;
using Vehicle_Management_System.DTOs.Notification;
using Vehicle_Management_System.DTOs.Part;
using Vehicle_Management_System.DTOs.PartRequest;
using Vehicle_Management_System.DTOs.PurchaseInvoice;
using Vehicle_Management_System.DTOs.Review;
using Vehicle_Management_System.DTOs.SalesInvoice;
using Vehicle_Management_System.DTOs.Staff;
using Vehicle_Management_System.DTOs.Vehicle;
using Vehicle_Management_System.DTOs.Vendor;
using Vehicle_Management_System.Models;

namespace Vehicle_Management_System.Helpers;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ── Auth / User ───────────────────────────────────────────────────────
        CreateMap<User, UserProfileDto>()
            .ForMember(d => d.Role, o => o.MapFrom(s => s.Role != null ? s.Role.Name : string.Empty));

        // ── Staff ─────────────────────────────────────────────────────────────
        CreateMap<Models.Staff, StaffResponseDto>()
            .ForMember(d => d.FullName,  o => o.MapFrom(s => s.User.FullName))
            .ForMember(d => d.Email,     o => o.MapFrom(s => s.User.Email))
            .ForMember(d => d.Phone,     o => o.MapFrom(s => s.User.Phone))
            .ForMember(d => d.IsActive,  o => o.MapFrom(s => s.User.IsActive));

        // ── Vendor ────────────────────────────────────────────────────────────
        CreateMap<Vendor, VendorResponseDto>();
        CreateMap<VendorDto, Vendor>();
        // For updates: map DTO properties onto existing entity
        CreateMap<VendorDto, Vendor>()
            .ForAllMembers(o => o.Condition((_, _, srcMember) => srcMember != null));

        // ── Part ──────────────────────────────────────────────────────────────
        CreateMap<Part, PartResponseDto>()
            .ForMember(d => d.VendorName, o => o.MapFrom(s => s.Vendor != null ? s.Vendor.Name : string.Empty));
        CreateMap<PartDto, Part>()
            .ForMember(d => d.CreatedAt, o => o.Ignore())
            .ForMember(d => d.Vendor,    o => o.Ignore())
            .ForMember(d => d.SalesInvoiceItems,    o => o.Ignore())
            .ForMember(d => d.PurchaseInvoiceItems, o => o.Ignore());

        // ── PurchaseInvoice ───────────────────────────────────────────────────
        CreateMap<PurchaseInvoice, PurchaseInvoiceResponseDto>()
            .ForMember(d => d.VendorName, o => o.MapFrom(s => s.Vendor != null ? s.Vendor.Name : string.Empty))
            .ForMember(d => d.Items,      o => o.MapFrom(s => s.PurchaseInvoiceItems));

        CreateMap<PurchaseInvoiceItem, PurchaseInvoiceItemResponseDto>()
            .ForMember(d => d.PartName, o => o.MapFrom(s => s.Part != null ? s.Part.Name : string.Empty))
            .ForMember(d => d.LineTotal, o => o.MapFrom(s => s.Quantity * s.UnitCostPrice));

        // ── Vehicle ───────────────────────────────────────────────────────────
        CreateMap<Models.Vehicle, VehicleResponseDto>();
        CreateMap<VehicleDto, Models.Vehicle>();

        // ── Customer ──────────────────────────────────────────────────────────
        CreateMap<Customer, CustomerListDto>()
            .ForMember(d => d.FullName,      o => o.MapFrom(s => s.User.FullName))
            .ForMember(d => d.Email,         o => o.MapFrom(s => s.User.Email))
            .ForMember(d => d.Phone,         o => o.MapFrom(s => s.User.Phone))
            .ForMember(d => d.IsActive,      o => o.MapFrom(s => s.User.IsActive))
            .ForMember(d => d.VehicleCount,  o => o.MapFrom(s => s.Vehicles.Count));

        CreateMap<Customer, CustomerDetailDto>()
            .ForMember(d => d.FullName,  o => o.MapFrom(s => s.User.FullName))
            .ForMember(d => d.Email,     o => o.MapFrom(s => s.User.Email))
            .ForMember(d => d.Phone,     o => o.MapFrom(s => s.User.Phone))
            .ForMember(d => d.IsActive,  o => o.MapFrom(s => s.User.IsActive));

        CreateMap<Customer, CustomerSearchResultDto>()
            .ForMember(d => d.FullName, o => o.MapFrom(s => s.User.FullName))
            .ForMember(d => d.Email,    o => o.MapFrom(s => s.User.Email))
            .ForMember(d => d.Phone,    o => o.MapFrom(s => s.User.Phone));

        // ── SalesInvoice ──────────────────────────────────────────────────────
        CreateMap<SalesInvoice, SalesInvoiceResponseDto>()
            .ForMember(d => d.CustomerName,   o => o.MapFrom(s => s.Customer != null ? s.Customer.User.FullName : string.Empty))
            .ForMember(d => d.StaffName,      o => o.MapFrom(s => s.Staff != null ? s.Staff.User.FullName : string.Empty))
            .ForMember(d => d.DiscountAmount, o => o.MapFrom(s => s.DiscountApplied ? s.TotalAmount / 9 : 0))
            .ForMember(d => d.Items,          o => o.MapFrom(s => s.SalesInvoiceItems));

        CreateMap<SalesInvoiceItem, SalesInvoiceItemResponseDto>()
            .ForMember(d => d.PartName, o => o.MapFrom(s => s.Part != null ? s.Part.Name : string.Empty))
            .ForMember(d => d.LineTotal, o => o.MapFrom(s => s.Quantity * s.UnitSellingPrice));

        // ── Notification ─────────────────────────────────────────────────────
        CreateMap<Notification, NotificationResponseDto>();

        // ── Appointment ────────────────────────────────────────────────────
        CreateMap<Appointment, AppointmentResponseDto>()
            .ForMember(d => d.VehicleInfo, o => o.MapFrom(s =>
                s.Vehicle != null
                    ? $"{s.Vehicle.Make} {s.Vehicle.Model} ({s.Vehicle.Year})"
                    : string.Empty))
            .ForMember(d => d.NumberPlate, o => o.MapFrom(s =>
                s.Vehicle != null ? s.Vehicle.NumberPlate : null));

        // ── PartRequest ─────────────────────────────────────────────────────
        CreateMap<PartRequest, PartRequestResponseDto>();

        // ── Review ─────────────────────────────────────────────────────────
        CreateMap<Review, ReviewResponseDto>()
            .ForMember(d => d.CustomerName, o => o.MapFrom(s =>
                s.Customer != null && s.Customer.User != null
                    ? s.Customer.User.FullName
                    : string.Empty));
    }
}
