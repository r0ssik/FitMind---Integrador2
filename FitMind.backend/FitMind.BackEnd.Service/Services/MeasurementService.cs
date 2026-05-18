using FitMind.BackEnd.Service.Dtos.Measurement;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

public class MeasurementService(AppDbContext context) : IMeasurementService
{
    public async Task<IEnumerable<MeasurementDto>> GetAllAsync(Guid userId) =>
        (await context.BodyMeasurements
            .Where(m => m.UserId == userId)
            .OrderByDescending(m => m.Date)
            .ToListAsync())
        .Select(MapToDto);

    public async Task<MeasurementDto> AddAsync(Guid userId, CreateMeasurementDto dto)
    {
        var m = new BodyMeasurement
        {
            UserId = userId,
            Date = dto.Date,
            Weight = dto.Weight,
            BodyFatPercentage = dto.BodyFatPercentage,
            MuscleMassPercentage = dto.MuscleMassPercentage,
            Arm = dto.Arm,
            Waist = dto.Waist,
            Hip = dto.Hip,
            Thigh = dto.Thigh,
            Chest = dto.Chest,
            Notes = dto.Notes
        };

        await context.BodyMeasurements.AddAsync(m);
        await context.SaveChangesAsync();
        return MapToDto(m);
    }

    public async Task DeleteAsync(Guid userId, Guid id)
    {
        var m = await context.BodyMeasurements
            .FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId)
            ?? throw new KeyNotFoundException("Medição não encontrada.");
        context.BodyMeasurements.Remove(m);
        await context.SaveChangesAsync();
    }

    private static MeasurementDto MapToDto(BodyMeasurement m) => new(
        m.Id, m.Date, m.Weight, m.BodyFatPercentage, m.MuscleMassPercentage,
        m.Arm, m.Waist, m.Hip, m.Thigh, m.Chest, m.Notes);
}
