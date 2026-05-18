using FitMind.BackEnd.Service.Dtos.Diet;
using FitMind.BackEnd.Service.Dtos.Workout;

namespace FitMind.BackEnd.Service.Interfaces;

public interface IAiGeneratorService
{
    Task<WorkoutPlanDto> GenerateWorkoutPlanAsync(Guid userId, AiGenerateWorkoutDto dto);
    Task<DietPlanDto> GenerateDietPlanAsync(Guid userId, AiGenerateDietDto dto);
}
