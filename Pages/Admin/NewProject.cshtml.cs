using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Portfolio.DTOs;
using Portfolio.Services;

namespace Portfolio.Pages.Admin;

[Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
public class NewProjectModel : PageModel
{
    private readonly IProjectService _projectService;

    public NewProjectModel(IProjectService projectService) => _projectService = projectService;

    [BindProperty] public ProjectFormInput Input { get; set; } = new();
    public string? ErrorMessage { get; set; }

    public void OnGet() { }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();

        var tags = Input.Tags?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
        var result = await _projectService.CreateAsync(new CreateProjectRequest(
            Input.Title, Input.Description, Input.Summary, Input.Status,
            Input.IsPublic, Input.SortOrder, Input.RepoUrl, Input.LiveUrl, tags
        ));

        if (!result.IsSuccess) { ErrorMessage = result.Error; return Page(); }
        return RedirectToPage("/Admin/Projects");
    }
}
