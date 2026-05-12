using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portfolio.Services;

namespace Portfolio.Controllers.Api;

[ApiController]
[Route("api/messages")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messageService;

    public MessagesController(IMessageService messageService) => _messageService = messageService;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _messageService.GetAllAsync();
        return Ok(result.Value);
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var result = await _messageService.MarkReadAsync(id);
        if (!result.IsSuccess) return NotFound(new { error = result.Error });
        return NoContent();
    }
}
