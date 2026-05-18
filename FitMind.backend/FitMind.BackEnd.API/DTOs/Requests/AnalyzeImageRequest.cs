using Microsoft.AspNetCore.Http;

namespace FitMind.BackEnd.API.DTOs.Requests
{
    public class AnalyzeImageRequest
    {
        public IFormFile Image { get; set; }
    }
}