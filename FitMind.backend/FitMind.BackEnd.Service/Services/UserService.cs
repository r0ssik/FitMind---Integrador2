using FitMind.BackEnd.Service.Dtos.User;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.Repositories;

namespace FitMind.BackEnd.Service.Services;

public class UserService(UserRepository userRepository) : IUserService
{
    public async Task<UserDto> GetByIdAsync(Guid id)
    {
        var user = await userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");
        return MapToDto(user);
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await userRepository.GetAllAsync();
        return users.Select(MapToDto);
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto)
    {
        var user = await userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        if (dto.Name is not null) user.Name = dto.Name;
        if (dto.Phone is not null) user.Phone = dto.Phone;
        if (dto.Bio is not null) user.Bio = dto.Bio;
        if (dto.AvatarUrl is not null) user.AvatarUrl = dto.AvatarUrl;
        if (dto.Weight.HasValue) user.Weight = dto.Weight.Value;
        if (dto.Height.HasValue) user.Height = dto.Height.Value;
        if (dto.Limitations is not null) user.Limitations = dto.Limitations;

        userRepository.Update(user);
        await userRepository.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task SetActiveAsync(Guid id, bool isActive)
    {
        var user = await userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");
        user.IsActive = isActive;
        userRepository.Update(user);
        await userRepository.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await userRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");
        userRepository.Remove(user);
        await userRepository.SaveChangesAsync();
    }

    private static UserDto MapToDto(SystemInfra.Entities.User u) => new(
        u.Id, u.Name, u.Email, u.Phone, u.BirthDate, u.Sex,
        u.Weight, u.Height, u.Bio, u.AvatarUrl, u.Limitations,
        u.IsAdmin, u.IsActive, u.CreatedAt
    );
}
