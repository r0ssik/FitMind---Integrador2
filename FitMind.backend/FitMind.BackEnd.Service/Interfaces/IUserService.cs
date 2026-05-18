using FitMind.BackEnd.Service.Dtos.User;

namespace FitMind.BackEnd.Service.Interfaces;

public interface IUserService
{
    Task<UserDto> GetByIdAsync(Guid id);
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto);
    Task SetActiveAsync(Guid id, bool isActive);
    Task DeleteAsync(Guid id);
}
