using Microsoft.AspNetCore.Mvc;
using Portfolio.DTOs;
using Portfolio.Services;

namespace Portfolio.Controllers.Api;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly IMessageService _messageService;

    public ContactController(IMessageService messageService) => _messageService = messageService;

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] CreateMessageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Body))
            return BadRequest(new { error = "Name, email, and message are required." });

        var result = await _messageService.AddAsync(request);
        if (!result.IsSuccess) return BadRequest(new { error = result.Error });

        return Ok(new { message = "Message received. Thank you!" });
    }
}
