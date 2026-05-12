using Microsoft.AspNetCore.Mvc.RazorPages;
using Portfolio.DTOs;
using Portfolio.Services;

namespace Portfolio.Pages;

public class RoadmapModel : PageModel
{
    private readonly IProjectService _projectService;
    private readonly IChangelogService _changelogService;

    public RoadmapModel(IProjectService projectService, IChangelogService changelogService)
    {
        _projectService = projectService;
        _changelogService = changelogService;
    }

    public List<ProjectResponse> Projects { get; set; } = [];
    public Dictionary<Guid, List<ChangelogEntryResponse>> Changelog { get; set; } = [];

    public async Task OnGetAsync()
    {
        var projectsResult = await _projectService.GetAllPublicAsync();
        if (!projectsResult.IsSuccess) return;

        Projects = projectsResult.Value!;

        // Fetch all changelogs in parallel
        var changelogTasks = Projects.Select(async p =>
        {
            var result = await _changelogService.GetForProjectAsync(p.Id);
            return (p.Id, Entries: result.IsSuccess ? result.Value! : new List<ChangelogEntryResponse>());
        });

        foreach (var (id, entries) in await Task.WhenAll(changelogTasks))
            Changelog[id] = entries;
    }
}
