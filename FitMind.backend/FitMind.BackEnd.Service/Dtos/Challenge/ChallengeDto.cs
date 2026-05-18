using FitMind.BackEnd.SystemInfra.Enums;

namespace FitMind.BackEnd.Service.Dtos.Challenge;

public record ChallengeDto(
    Guid Id,
    string Name,
    string Description,
    ChallengeType Type,
    decimal Goal,
    string Unit,
    DateTime StartDate,
    DateTime EndDate,
    int DaysLeft,
    string CreatedByName,
    int ParticipantCount,
    List<ChallengeParticipantDto> Participants,
    decimal? MyProgress,
    bool IsParticipating
);

public record ChallengeParticipantDto(
    Guid UserId,
    string Name,
    string Initials,
    decimal CurrentProgress,
    decimal ProgressPercent,
    int Rank
);

public record CreateChallengeDto(
    string Name,
    string Description,
    ChallengeType Type,
    decimal Goal,
    string Unit,
    DateTime StartDate,
    DateTime EndDate
);

public record UpdateChallengeProgressDto(decimal Progress);
