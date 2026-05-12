using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Portfolio.DTOs;
using Portfolio.Services;

namespace Portfolio.Pages.Admin;

[Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
public class ProjectsModel : PageModel
{
    private readonly IProjectService _projectService;

    public ProjectsModel(IProjectService projectService) => _projectService = projectService;

    public List<ProjectResponse> Projects { get; set; } = [];

    public async Task OnGetAsync()
    {
        var result = await _projectService.GetAllAsync();
        if (result.IsSuccess) Projects = result.Value!;
    }

    public async Task<IActionResult> OnPostDeleteAsync(Guid id)
    {
        await _projectService.DeleteAsync(id);
        return RedirectToPage();
    }
}
