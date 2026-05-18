namespace FitMind.BackEnd.Service.Dtos.Workout;

public record AiGenerateWorkoutDto(
    int DaysPerWeek,
    int MinutesPerSession,
    string Location,        // academia / casa / ar_livre / funcional
    List<string> Preferences, // Musculação, Cardio, HIIT, etc.
    List<string> Limitations  // Joelho, Coluna, etc.
);

public record AiGenerateDietDto(
    string Goal,           // emagrecer / hipertrofia / manutencao / saude
    string Budget,         // low / medium / high
    int MealsPerDay,
    List<string> Restrictions, // Lactose, Glúten, Vegano, etc.
    List<string> FoodPreferences
);
