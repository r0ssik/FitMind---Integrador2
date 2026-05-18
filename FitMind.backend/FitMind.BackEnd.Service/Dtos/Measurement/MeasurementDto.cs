namespace FitMind.BackEnd.Service.Dtos.Measurement;

public record MeasurementDto(
    Guid Id,
    DateTime Date,
    decimal? Weight,
    decimal? BodyFatPercentage,
    decimal? MuscleMassPercentage,
    decimal? Arm,
    decimal? Waist,
    decimal? Hip,
    decimal? Thigh,
    decimal? Chest,
    string? Notes
);

public record CreateMeasurementDto(
    DateTime Date,
    decimal? Weight,
    decimal? BodyFatPercentage,
    decimal? MuscleMassPercentage,
    decimal? Arm,
    decimal? Waist,
    decimal? Hip,
    decimal? Thigh,
    decimal? Chest,
    string? Notes
);
