using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Portfolio.DTOs;
using Portfolio.Services;

namespace Portfolio.Pages;

public class ProjectDetailModel : PageModel
{
    private readonly IProjectService _projectService;
    private readonly IChangelogService _changelogService;

    public ProjectDetailModel(IProjectService projectService, IChangelogService changelogService)
    {
        _projectService = projectService;
        _changelogService = changelogService;
    }

    public ProjectResponse? Project { get; set; }
    public List<ChangelogEntryResponse> ChangelogEntries { get; set; } = [];

    public async Task<IActionResult> OnGetAsync(Guid id)
    {
        var result = await _projectService.GetByIdAsync(id);
        if (!result.IsSuccess) return NotFound();

        Project = result.Value;

        var changelog = await _changelogService.GetForProjectAsync(id);
        if (changelog.IsSuccess)
            ChangelogEntries = changelog.Value!.OrderByDescending(e => e.CreatedAt).ToList();

        return Page();
    }
}
