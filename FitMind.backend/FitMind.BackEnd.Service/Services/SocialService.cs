using FitMind.BackEnd.Service.Dtos.Social;
using FitMind.BackEnd.Service.Interfaces;
using FitMind.BackEnd.SystemInfra.ContextDb;
using FitMind.BackEnd.SystemInfra.Entities;
using Microsoft.EntityFrameworkCore;
using FitMind.BackEnd.SystemInfra.Enums;

namespace FitMind.BackEnd.Service.Services;

public class SocialService(AppDbContext context) : ISocialService
{
    public async Task<IEnumerable<PostDto>> GetFeedAsync(Guid currentUserId, int page = 1, int pageSize = 20, bool onlyFollowing = false)
    {
        var query = context.Posts
            .Include(p => p.User)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .AsQueryable();

        if (onlyFollowing)
        {
            var followingIds = await context.Follows
                .Where(f => f.FollowerId == currentUserId)
                .Select(f => f.FollowingId)
                .ToListAsync();

            followingIds.Add(currentUserId);

            query = query.Where(p => followingIds.Contains(p.UserId));
        }

        var posts = await query
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
        var post = await context.Posts
            .FirstOrDefaultAsync(p => p.Id == postId && p.UserId == userId)
            ?? throw new KeyNotFoundException("Post não encontrado.");

        context.Posts.Remove(post);

        await context.SaveChangesAsync();
    }

    public async Task LikePostAsync(Guid userId, Guid postId)
    {
        var post = await context.Posts
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == postId);

        if (post is null)
            throw new KeyNotFoundException("Post não encontrado.");

        var exists = await context.PostLikes
            .AnyAsync(l => l.PostId == postId && l.UserId == userId);

        if (exists)
            return;

        await context.PostLikes.AddAsync(new PostLike
        {
            PostId = postId,
            UserId = userId
        });

        // não envia notificação para si mesmo
        if (post.UserId != userId)
        {
            var user = await context.Users.FindAsync(userId);

            await context.Notifications.AddAsync(new Notification
            {
                UserId = post.UserId,
                Type = NotificationType.Like,
                Title = "Nova curtida",
                Body = $"{user!.Name} curtiu seu post.",
                IsRead = false
            });
        }

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
            .Select(c => new CommentDto(
                c.Id,
                c.UserId,
                c.User.Name,
                c.Content,
                c.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<CommentDto> AddCommentAsync(Guid userId, Guid postId, CreateCommentDto dto)
    {
        var post = await context.Posts
            .FirstOrDefaultAsync(p => p.Id == postId);

        if (post is null)
            throw new KeyNotFoundException("Post não encontrado.");

        var comment = new Comment
        {
            PostId = postId,
            UserId = userId,
            Content = dto.Content
        };

        await context.Comments.AddAsync(comment);

        // não envia notificação para si mesmo
        if (post.UserId != userId)
        {
            var user = await context.Users.FindAsync(userId);

            await context.Notifications.AddAsync(new Notification
            {
                UserId = post.UserId,
                Type = NotificationType.Comment,
                Title = "Novo comentário",
                Body = $"{user!.Name} comentou no seu post.",
                IsRead = false
            });
        }

        await context.SaveChangesAsync();

        await context.Entry(comment)
            .Reference(c => c.User)
            .LoadAsync();

        return new CommentDto(
            comment.Id,
            comment.UserId,
            comment.User.Name,
            comment.Content,
            comment.CreatedAt
        );
    }

    public async Task FollowUserAsync(Guid followerId, Guid followingId)
    {
        var exists = await context.Follows
            .AnyAsync(f => f.FollowerId == followerId && f.FollowingId == followingId);

        if (exists)
            return;

        await context.Follows.AddAsync(new Follow
        {
            FollowerId = followerId,
            FollowingId = followingId
        });

        if (followerId != followingId)
        {
            var user = await context.Users.FindAsync(followerId);

            await context.Notifications.AddAsync(new Notification
            {
                UserId = followingId,
                Type = NotificationType.Follow,
                Title = "Novo seguidor",
                Body = $"{user!.Name} começou a seguir você.",
                IsRead = false
            });
        }

        await context.SaveChangesAsync();
    }

    public async Task UnfollowUserAsync(Guid followerId, Guid followingId)
    {
        await context.Follows
            .Where(f => f.FollowerId == followerId && f.FollowingId == followingId)
            .ExecuteDeleteAsync();
    }

    private static PostDto MapToDto(Post p, Guid currentUserId) => new(
        p.Id,
        p.UserId,
        p.User?.Name ?? string.Empty,
        p.User?.AvatarUrl,
        p.Content,
        p.Tags,
        p.ImageUrl,
        p.Likes?.Count ?? 0,
        p.Comments?.Count ?? 0,
        p.Likes?.Any(l => l.UserId == currentUserId) ?? false,
        p.CreatedAt
    );
}