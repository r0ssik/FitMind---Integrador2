using FitMind.BackEnd.API.Extensions;
using FitMind.BackEnd.Service.Dtos.Social;
using FitMind.BackEnd.Service.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitMind.BackEnd.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class SocialController(ISocialService socialService) : ControllerBase
{
    [HttpGet("feed")]
    public async Task<IActionResult> GetFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = User.GetUserId();
        return Ok(await socialService.GetFeedAsync(userId, page, pageSize));
    }

    [HttpPost("posts")]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostDto dto)
    {
        var userId = User.GetUserId();
        var post = await socialService.CreatePostAsync(userId, dto);
        return Created(string.Empty, post);
    }

    [HttpDelete("posts/{postId}")]
    public async Task<IActionResult> DeletePost(Guid postId)
    {
        var userId = User.GetUserId();
        await socialService.DeletePostAsync(userId, postId);
        return NoContent();
    }

    [HttpPost("posts/{postId}/like")]
    public async Task<IActionResult> Like(Guid postId)
    {
        await socialService.LikePostAsync(User.GetUserId(), postId);
        return NoContent();
    }

    [HttpDelete("posts/{postId}/like")]
    public async Task<IActionResult> Unlike(Guid postId)
    {
        await socialService.UnlikePostAsync(User.GetUserId(), postId);
        return NoContent();
    }

    [HttpGet("posts/{postId}/comments")]
    public async Task<IActionResult> GetComments(Guid postId) =>
        Ok(await socialService.GetCommentsAsync(postId));

    [HttpPost("posts/{postId}/comments")]
    public async Task<IActionResult> AddComment(Guid postId, [FromBody] CreateCommentDto dto)
    {
        var comment = await socialService.AddCommentAsync(User.GetUserId(), postId, dto);
        return Created(string.Empty, comment);
    }

    [HttpPost("follow/{followingId}")]
    public async Task<IActionResult> Follow(Guid followingId)
    {
        await socialService.FollowUserAsync(User.GetUserId(), followingId);
        return NoContent();
    }

    [HttpDelete("follow/{followingId}")]
    public async Task<IActionResult> Unfollow(Guid followingId)
    {
        await socialService.UnfollowUserAsync(User.GetUserId(), followingId);
        return NoContent();
    }
}
