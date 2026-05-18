using FitMind.BackEnd.Service.Dtos.Social;

namespace FitMind.BackEnd.Service.Interfaces;

public interface ISocialService
{
    Task<IEnumerable<PostDto>> GetFeedAsync(Guid currentUserId, int page = 1, int pageSize = 20);
    Task<PostDto> CreatePostAsync(Guid userId, CreatePostDto dto);
    Task DeletePostAsync(Guid userId, Guid postId);
    Task LikePostAsync(Guid userId, Guid postId);
    Task UnlikePostAsync(Guid userId, Guid postId);
    Task<IEnumerable<CommentDto>> GetCommentsAsync(Guid postId);
    Task<CommentDto> AddCommentAsync(Guid userId, Guid postId, CreateCommentDto dto);
    Task FollowUserAsync(Guid followerId, Guid followingId);
    Task UnfollowUserAsync(Guid followerId, Guid followingId);
}
