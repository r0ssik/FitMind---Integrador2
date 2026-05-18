using FitMind.BackEnd.SystemInfra.Base;

namespace FitMind.BackEnd.SystemInfra.Entities;

public class Post : BaseEntity
{
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Tags { get; set; }
    public string? ImageUrl { get; set; }

    public User User { get; set; } = null!;
    public ICollection<PostLike> Likes { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
}
