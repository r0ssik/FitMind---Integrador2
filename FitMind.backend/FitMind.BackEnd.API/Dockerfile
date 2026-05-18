FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["FitMind.BackEnd.API/FitMind.BackEnd.API.csproj", "FitMind.BackEnd.API/"]
COPY ["FitMind.BackEnd.IoC/FitMind.BackEnd.IoC.csproj", "FitMind.BackEnd.IoC/"]
COPY ["FitMind.BackEnd.Service/FitMind.BackEnd.Service.csproj", "FitMind.BackEnd.Service/"]
COPY ["FitMind.BackEnd.SystemInfra/FitMind.BackEnd.SystemInfra.csproj", "FitMind.BackEnd.SystemInfra/"]
COPY ["FitMind.BackEnd.Domain/FitMind.BackEnd.Domain.csproj", "FitMind.BackEnd.Domain/"]

RUN dotnet restore "FitMind.BackEnd.API/FitMind.BackEnd.API.csproj"

COPY . .

WORKDIR "/src/FitMind.BackEnd.API"
RUN dotnet build "FitMind.BackEnd.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FitMind.BackEnd.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FitMind.BackEnd.API.dll"]
