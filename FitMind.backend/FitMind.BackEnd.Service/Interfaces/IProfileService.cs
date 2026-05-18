using FitMind.BackEnd.Service.Dtos.Profile;

namespace FitMind.BackEnd.Service.Interfaces;

public interface IProfileService
{
    Task<PublicProfileDto> GetPublicProfileAsync(Guid profileUserId, Guid currentUserId);
}
