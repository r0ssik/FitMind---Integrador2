using FitMind.BackEnd.Service.Dtos.Social;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.Service.Services;

public class SocialService(AppDbContext context) : ISocialService
{
    public async Task<IEnumerable<PostDto>> GetFeedAsync(Guid currentUserId, int page = 1, int pageSize = 20)
    {
        var posts = await context.Posts
            .Include(p => p.User)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return posts.Select(p => MapToDto(p, currentUserId));
    }

    public async Task<PostDto> CreatePostAsync(Guid userId, CreatePostDto dto)
    {
        var post = new Post
        {
            UserId = userId,
            Content = dto.Content,
            Tags = dto.Tags,
            ImageUrl = dto.ImageUrl
        };

        await context.Posts.AddAsync(post);
        await context.SaveChangesAsync();

        await context.Entry(post).Reference(p => p.User).LoadAsync();
        return MapToDto(post, userId);
    }

    public async Task DeletePostAsync(Guid userId, Guid postId)
    {
        var post = await context.Posts.FirstOrDefaultAsync(p => p.Id == postId && p.UserId == userId)
            ?? throw new KeyNotFoundException("Post não encontrado.");

        context.Posts.Remove(post);
        await context.SaveChangesAsync();
    }

    public async Task LikePostAsync(Guid userId, Guid postId)
    {
        var exists = await context.PostLikes.AnyAsync(l => l.PostId == postId && l.UserId == userId);
        if (exists) return;

        await context.PostLikes.AddAsync(new PostLike { PostId = postId, UserId = userId });
        await context.SaveChangesAsync();
    }

    public async Task UnlikePostAsync(Guid userId, Guid postId)
    {
        await context.PostLikes
            .Where(l => l.PostId == postId && l.UserId == userId)
            .ExecuteDeleteAsync();
    }

    public async Task<IEnumerable<CommentDto>> GetCommentsAsync(Guid postId)
    {
        return await context.Comments
            .Include(c => c.User)
            .Where(c => c.PostId == postId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CommentDto(c.Id, c.UserId, c.User.Name, c.Content, c.CreatedAt))
            .ToListAsync();
    }

    public async Task<CommentDto> AddCommentAsync(Guid userId, Guid postId, CreateCommentDto dto)
    {
        var comment = new Comment { PostId = postId, UserId = userId, Content = dto.Content };
        await context.Comments.AddAsync(comment);
        await context.SaveChangesAsync();

        await context.Entry(comment).Reference(c => c.User).LoadAsync();
        return new CommentDto(comment.Id, comment.UserId, comment.User.Name, comment.Content, comment.CreatedAt);
    }

    public async Task FollowUserAsync(Guid followerId, Guid followingId)
    {
        var exists = await context.Follows.AnyAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);
        if (exists) return;

        await context.Follows.AddAsync(new Follow { FollowerId = followerId, FollowingId = followingId });
        await context.SaveChangesAsync();
    }

    public async Task UnfollowUserAsync(Guid followerId, Guid followingId)
    {
        await context.Follows
            .Where(f => f.FollowerId == followerId && f.FollowingId == followingId)
            .ExecuteDeleteAsync();
    }

    private static PostDto MapToDto(Post p, Guid currentUserId) => new(
        p.Id, p.UserId, p.User?.Name ?? string.Empty, p.User?.AvatarUrl,
        p.Content, p.Tags, p.ImageUrl,
        p.Likes?.Count ?? 0,
        p.Comments?.Count ?? 0,
        p.Likes?.Any(l => l.UserId == currentUserId) ?? false,
        p.CreatedAt
    );
}
