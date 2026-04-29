using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Vehicle_Management_System.Data;
using Vehicle_Management_System.DTOs.Vendor;
using Vehicle_Management_System.Models;
using Vehicle_Management_System.Services.Interfaces;

namespace Vehicle_Management_System.Services;

public class VendorService : IVendorService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public VendorService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<VendorResponseDto>> GetAllAsync()
    {
        var vendors = await _context.Vendors
            .OrderBy(v => v.Name)
            .ToListAsync();

        return _mapper.Map<List<VendorResponseDto>>(vendors);
    }

    public async Task<VendorResponseDto> GetByIdAsync(int id)
    {
        var vendor = await _context.Vendors.FindAsync(id)
            ?? throw new KeyNotFoundException($"Vendor with ID {id} not found.");

        return _mapper.Map<VendorResponseDto>(vendor);
    }

    public async Task<VendorResponseDto> CreateAsync(VendorDto dto)
    {
        var vendor = _mapper.Map<Vendor>(dto);
        _context.Vendors.Add(vendor);
        await _context.SaveChangesAsync();
        return _mapper.Map<VendorResponseDto>(vendor);
    }

    public async Task<VendorResponseDto> UpdateAsync(int id, VendorDto dto)
    {
        var vendor = await _context.Vendors.FindAsync(id)
            ?? throw new KeyNotFoundException($"Vendor with ID {id} not found.");

        _mapper.Map(dto, vendor);
        await _context.SaveChangesAsync();
        return _mapper.Map<VendorResponseDto>(vendor);
    }

    public async Task DeleteAsync(int id)
    {
        var vendor = await _context.Vendors.FindAsync(id)
            ?? throw new KeyNotFoundException($"Vendor with ID {id} not found.");

        var hasParts = await _context.Parts.AnyAsync(p => p.VendorId == id);
        if (hasParts)
            throw new InvalidOperationException(
                "Cannot delete this vendor because it has associated parts. " +
                "Reassign or delete those parts first.");

        _context.Vendors.Remove(vendor);
        await _context.SaveChangesAsync();
    }
}
