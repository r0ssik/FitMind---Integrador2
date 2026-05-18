namespace FitMind.BackEnd.Service.Dtos.Water;

public record WaterIntakeDto(DateTime Date, int Cups, int Goal);
public record SetWaterCupsDto(int Cups);
