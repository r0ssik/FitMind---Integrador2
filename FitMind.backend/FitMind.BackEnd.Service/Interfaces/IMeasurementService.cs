using FitMind.BackEnd.Service.Dtos.Measurement;

namespace FitMind.BackEnd.Service.Interfaces;

public interface IMeasurementService
{
    Task<IEnumerable<MeasurementDto>> GetAllAsync(Guid userId);
    Task<MeasurementDto> AddAsync(Guid userId, CreateMeasurementDto dto);
    Task DeleteAsync(Guid userId, Guid id);
}
