using System.Net.Http;
using System.Text;
using System.Text.Json;
using FitMind.BackEnd.Service.Dtos.Workout;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Net;

namespace FitMind.BackEnd.Service.Services.AI;

public class GeminiService
{
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _context;
    private readonly string _apiKey;
    private readonly bool _useMock;

    public GeminiService(
        HttpClient httpClient,
        AppDbContext context,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _context = context;
        bool.TryParse(configuration["Gemini:UseMock"], out _useMock);

        _apiKey = configuration["Gemini:ApiKey"] ?? string.Empty;

        if (!_useMock && string.IsNullOrWhiteSpace(_apiKey))
            throw new Exception("Gemini API Key nao encontrada.");
    }

    public async Task<JsonElement> GenerateWorkoutAsync(Guid userId, AiGenerateWorkoutDto request)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("Usuario nao encontrado.");

        if (_useMock)
            return BuildMockWorkout(request);

        var prompt = BuildWorkoutPrompt(user, request);

        var body = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new
                        {
                            text = prompt
                        }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.35,
                topP = 0.8,
                maxOutputTokens = 2500,
                responseMimeType = "application/json",
                responseJsonSchema = BuildCompactWorkoutSchema()
            }
        };

        using var httpRequest = new HttpRequestMessage(
            HttpMethod.Post,
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent");

        httpRequest.Headers.Add("x-goog-api-key", _apiKey);
        httpRequest.Content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json");

        var response = await _httpClient.SendAsync(httpRequest);

        if (!response.IsSuccessStatusCode)
        {
            if (response.StatusCode == HttpStatusCode.TooManyRequests)
                return BuildMockWorkout(request);

            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Erro Gemini: {response.StatusCode} - {error}");
        }   

        await using var responseStream = await response.Content.ReadAsStreamAsync();
        using var responseJson = await JsonDocument.ParseAsync(responseStream);

        var text = responseJson.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrWhiteSpace(text))
            throw new Exception("Gemini retornou uma resposta vazia.");

        using var workoutJson = JsonDocument.Parse(text);
        return workoutJson.RootElement.Clone();
    }

    private static string BuildWorkoutPrompt(User user, AiGenerateWorkoutDto request)
    {
        var age = CalculateAge(user.BirthDate);
        var goals = ParseJsonList(user.Goals);
        var limitations = MergeLimitations(user.Limitations, request.Limitations);
        var preferences = request.Preferences?.Count > 0
            ? string.Join(", ", request.Preferences)
            : "sem preferencia";

        var userGoals = goals.Count > 0
            ? string.Join(", ", goals)
            : preferences;

        return $"""
Voce e um treinador de musculacao. Gere um treino seguro, especifico e curto para este aluno.

Dados:
- idade: {age}
- sexo: {user.Sex}
- pesoKg: {user.Weight}
- alturaCm: {user.Height}
- objetivosAluno: {userGoals}
- preferenciasTreino: {preferences}
- limitacoes: {limitations}
- frequencia: {Math.Clamp(request.DaysPerWeek, 1, 6)} dias/semana
- duracao: {Math.Clamp(request.MinutesPerSession, 20, 120)} min/sessao
- local: {request.Location}

Regras de divisao:
- 1 dia: full body.
- 2 dias: superior/inferior.
- 3 dias: push/pull/legs ou full body A/B/C.
- 4 dias: superior/inferior 2x.
- 5 dias: push/pull/legs + superior/inferior.
- 6 dias: push/pull/legs 2x.

Regras:
- Respeite limitacoes, evitando exercicios que agravem dor.
- Ajuste volume ao tempo da sessao.
- Use exercicios de academia quando local=academia.
- Retorne JSON minificado, sem markdown e sem campos extras.
- Use nomes em portugues e dicas curtas.
""";
    }

    private static object BuildCompactWorkoutSchema()
    {
        return new
        {
            type = "object",
            propertyOrdering = new[] { "n", "g", "w", "d", "a" },
            properties = new
            {
                n = new { type = "string", description = "Nome curto do plano." },
                g = new { type = "string", description = "Objetivo principal." },
                w = new { type = "integer", description = "Duracao do plano em semanas." },
                d = new
                {
                    type = "array",
                    description = "Dias de treino conforme a frequencia informada.",
                    items = new
                    {
                        type = "object",
                        propertyOrdering = new[] { "i", "n", "f", "e" },
                        properties = new
                        {
                            i = new { type = "integer", description = "Ordem do dia." },
                            n = new { type = "string", description = "Nome do dia da semana." },
                            f = new { type = "string", description = "Foco muscular do dia." },
                            e = new
                            {
                                type = "array",
                                items = new
                                {
                                    type = "object",
                                    propertyOrdering = new[] { "n", "s", "r", "p", "o" },
                                    properties = new
                                    {
                                        n = new { type = "string", description = "Exercicio." },
                                        s = new { type = "integer", description = "Series." },
                                        r = new { type = "string", description = "Repeticoes." },
                                        p = new { type = "string", description = "Pausa." },
                                        o = new { type = "string", description = "Observacao curta." }
                                    },
                                    required = new[] { "n", "s", "r", "p", "o" }
                                },
                                minItems = 4,
                                maxItems = 6
                            }
                        },
                        required = new[] { "i", "n", "f", "e" }
                    },
                    minItems = 1,
                    maxItems = 6
                },
                a = new
                {
                    type = "array",
                    description = "Alertas curtos sobre limitacoes e seguranca.",
                    items = new { type = "string" },
                    maxItems = 3
                }
            },
            required = new[] { "n", "g", "w", "d", "a" }
        };
    }

    private static int CalculateAge(DateTime birthDate)
    {
        if (birthDate == default) return 0;

        var today = DateTime.UtcNow.Date;
        var age = today.Year - birthDate.Year;

        if (birthDate.Date > today.AddYears(-age))
            age--;

        return Math.Max(age, 0);
    }

    private static List<string> ParseJsonList(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return [];

        try
        {
            return JsonSerializer.Deserialize<List<string>>(value) ?? [];
        }
        catch (JsonException)
        {
            return [value];
        }
    }

    private static string MergeLimitations(string? userLimitations, List<string>? requestLimitations)
    {
        var all = new List<string>();

        if (!string.IsNullOrWhiteSpace(userLimitations))
            all.Add(userLimitations);

        if (requestLimitations is { Count: > 0 })
            all.AddRange(requestLimitations.Where(l => !string.IsNullOrWhiteSpace(l)));

        return all.Count > 0 ? string.Join(", ", all.Distinct()) : "nenhuma";
    }
    private static JsonElement BuildMockWorkout(AiGenerateWorkoutDto request)
    {
        var days = Math.Clamp(request.DaysPerWeek, 1, 6);

        var focuses = days switch
        {
            1 => new[] { "Full body" },
            2 => new[] { "Superior", "Inferior" },
            3 => new[] { "Push", "Pull", "Legs" },
            4 => new[] { "Superior A", "Inferior A", "Superior B", "Inferior B" },
            5 => new[] { "Push", "Pull", "Legs", "Superior", "Inferior" },
            _ => new[] { "Push A", "Pull A", "Legs A", "Push B", "Pull B", "Legs B" }
        };

        var plan = new
        {
            n = "Treino mock",
            g = request.Preferences?.FirstOrDefault() ?? "saude geral",
            w = 8,
            d = focuses.Select((focus, index) => new
            {
                i = index + 1,
                n = $"Dia {index + 1}",
                f = focus,
                e = new[]
                {
                    new { n = "Esteira leve", s = 1, r = "8 min", p = "0s", o = "aquecimento" },
                    new { n = "Agachamento guiado", s = 3, r = "10-12", p = "60s", o = "controle joelho" },
                    new { n = "Supino maquina", s = 3, r = "10-12", p = "60s", o = "carga moderada" },
                    new { n = "Puxada frontal", s = 3, r = "10-12", p = "60s", o = "postura neutra" },
                    new { n = "Prancha", s = 3, r = "30s", p = "45s", o = "core firme" }
                }
            }),
            a = new[]
            {
                "Mock ativo: resposta gerada sem chamar Gemini.",
                "UseMock=false para testar a IA real."
            }
        };

        using var document = JsonDocument.Parse(JsonSerializer.Serialize(plan));
        return document.RootElement.Clone();
    }

}
