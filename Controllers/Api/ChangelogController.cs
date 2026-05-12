using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portfolio.DTOs;
using Portfolio.Services;

namespace Portfolio.Controllers.Api;

[ApiController]
[Route("api/changelog")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChangelogController : ControllerBase
{
    private readonly IChangelogService _changelogService;

    public ChangelogController(IChangelogService changelogService) => _changelogService = changelogService;

    [HttpPut("{entryId:guid}")]
    public async Task<IActionResult> Update(Guid entryId, [FromBody] UpdateChangelogEntryRequest request)
    {
        var result = await _changelogService.UpdateEntryAsync(entryId, request);
        if (!result.IsSuccess) return NotFound(new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpDelete("{entryId:guid}")]
    public async Task<IActionResult> Delete(Guid entryId)
    {
        var result = await _changelogService.DeleteEntryAsync(entryId);
        if (!result.IsSuccess) return NotFound(new { error = result.Error });
        return NoContent();
    }
}
