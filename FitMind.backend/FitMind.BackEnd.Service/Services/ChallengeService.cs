using FitMind.BackEnd.Service.Dtos.Challenge;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

public class ChallengeService(AppDbContext context) : IChallengeService
{
    public async Task<IEnumerable<ChallengeDto>> GetAllAsync(Guid currentUserId)
    {
        var challenges = await context.Challenges
            .Include(c => c.CreatedBy)
            .Include(c => c.Participants).ThenInclude(p => p.User)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return challenges.Select(c => MapToDto(c, currentUserId));
    }

    public async Task<ChallengeDto> GetByIdAsync(Guid id, Guid currentUserId)
    {
        var challenge = await context.Challenges
            .Include(c => c.CreatedBy)
            .Include(c => c.Participants).ThenInclude(p => p.User)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException("Desafio não encontrado.");

        return MapToDto(challenge, currentUserId);
    }

    public async Task<ChallengeDto> CreateAsync(Guid userId, CreateChallengeDto dto)
    {
        var challenge = new Challenge
        {
            CreatedByUserId = userId,
            Name = dto.Name,
            Description = dto.Description,
            Type = dto.Type,
            Goal = dto.Goal,
            Unit = dto.Unit,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate
        };

        // Creator auto-joins
        challenge.Participants.Add(new ChallengeParticipant
        {
            UserId = userId,
            JoinedAt = DateTime.UtcNow
        });

        await context.Challenges.AddAsync(challenge);
        await context.SaveChangesAsync();

        return await GetByIdAsync(challenge.Id, userId);
    }

    public async Task JoinAsync(Guid userId, Guid challengeId)
    {
        var already = await context.ChallengeParticipants
            .AnyAsync(p => p.ChallengeId == challengeId && p.UserId == userId);
        if (already) return;

        await context.ChallengeParticipants.AddAsync(new ChallengeParticipant
        {
            ChallengeId = challengeId,
            UserId = userId,
            JoinedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();
    }

    public async Task UpdateProgressAsync(Guid userId, Guid challengeId, UpdateChallengeProgressDto dto)
    {
        var participant = await context.ChallengeParticipants
            .FirstOrDefaultAsync(p => p.ChallengeId == challengeId && p.UserId == userId)
            ?? throw new KeyNotFoundException("Você não participa deste desafio.");

        participant.CurrentProgress = dto.Progress;
        await context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid userId, Guid challengeId)
    {
        var challenge = await context.Challenges
            .FirstOrDefaultAsync(c => c.Id == challengeId && c.CreatedByUserId == userId)
            ?? throw new KeyNotFoundException("Desafio não encontrado ou sem permissão.");

        context.Challenges.Remove(challenge);
        await context.SaveChangesAsync();
    }

    private static ChallengeDto MapToDto(Challenge c, Guid currentUserId)
    {
        var ranked = c.Participants
            .OrderByDescending(p => p.CurrentProgress)
            .Select((p, i) => new ChallengeParticipantDto(
                p.UserId,
                p.User?.Name ?? "?",
                Initials(p.User?.Name),
                p.CurrentProgress,
                c.Goal > 0 ? Math.Round(p.CurrentProgress / c.Goal * 100, 1) : 0,
                i + 1))
            .ToList();

        var myPart = c.Participants.FirstOrDefault(p => p.UserId == currentUserId);
        int daysLeft = Math.Max(0, (c.EndDate.Date - DateTime.UtcNow.Date).Days);

        return new ChallengeDto(
            c.Id, c.Name, c.Description, c.Type, c.Goal, c.Unit,
            c.StartDate, c.EndDate, daysLeft,
            c.CreatedBy?.Name ?? "?",
            c.Participants.Count,
            ranked,
            myPart?.CurrentProgress,
            myPart is not null);
    }

    private static string Initials(string? name) =>
        string.IsNullOrWhiteSpace(name) ? "?" :
        string.Concat(name.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                          .Take(2).Select(w => char.ToUpper(w[0])));
}
