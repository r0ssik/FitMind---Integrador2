namespace FitMind.BackEnd.Service.Dtos.Social;

public record PostDto(
    Guid Id,
    Guid UserId,
    string UserName,
    string? UserAvatarUrl,
    string Content,
    string? Tags,
    string? ImageUrl,
    int LikesCount,
    int CommentsCount,
    bool IsLikedByCurrentUser,
    DateTime CreatedAt
);

public record CreatePostDto(string Content, string? Tags, string? ImageUrl);

public record CommentDto(
    Guid Id,
    Guid UserId,
    string UserName,
    string Content,
    DateTime CreatedAt
);

public record CreateCommentDto(string Content);
