using Microsoft.AspNetCore.Mvc.RazorPages;
using Portfolio.DTOs;
using Portfolio.Services;

namespace Portfolio.Pages;

public class IndexModel : PageModel
{
    private readonly IProjectService _projectService;

    public IndexModel(IProjectService projectService) => _projectService = projectService;

    public List<ProjectResponse> FeaturedProjects { get; set; } = [];

    public async Task OnGetAsync()
    {
        var result = await _projectService.GetAllPublicAsync();
        if (result.IsSuccess)
            FeaturedProjects = result.Value!
                .Where(p => p.Status is "Shipped" or "InProgress")
                .Take(3)
                .ToList();
    }
}
