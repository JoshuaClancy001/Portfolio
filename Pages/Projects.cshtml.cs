using Microsoft.AspNetCore.Mvc.RazorPages;
using Portfolio.DTOs;
using Portfolio.Services;

namespace Portfolio.Pages;

public class ProjectsModel : PageModel
{
    private readonly IProjectService _projectService;

    public ProjectsModel(IProjectService projectService) => _projectService = projectService;

    public List<ProjectResponse> Projects { get; set; } = [];

    public async Task OnGetAsync()
    {
        var result = await _projectService.GetAllPublicAsync();
        if (result.IsSuccess)
            Projects = result.Value!;
    }
}
