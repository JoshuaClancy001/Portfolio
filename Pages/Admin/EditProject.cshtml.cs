using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Portfolio.DTOs;
using Portfolio.Services;

namespace Portfolio.Pages.Admin;

[Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
public class EditProjectModel : PageModel
{
    private readonly IProjectService _projectService;
    private readonly IChangelogService _changelogService;
    private readonly IImageStorageService _imageStorage;

    public EditProjectModel(IProjectService projectService, IChangelogService changelogService, IImageStorageService imageStorage)
    {
        _projectService = projectService;
        _changelogService = changelogService;
        _imageStorage = imageStorage;
    }

    [BindProperty] public Guid ProjectId { get; set; }
    [BindProperty] public ProjectFormInput Input { get; set; } = new();

    public List<ChangelogEntryResponse> ChangelogEntries { get; set; } = [];
    public List<ProjectImageResponse> Images { get; set; } = [];
    public string? ErrorMessage { get; set; }

    public async Task<IActionResult> OnGetAsync(Guid id)
    {
        var result = await _projectService.GetByIdAsync(id, includeHidden: true);
        if (!result.IsSuccess) return NotFound();

        var project = result.Value!;
        ProjectId = project.Id;
        Input = new ProjectFormInput
        {
            Title = project.Title,
            Description = project.Description,
            Summary = project.Summary,
            Status = project.Status,
            IsPublic = project.IsPublic,
            SortOrder = project.SortOrder,
            RepoUrl = project.RepoUrl,
            LiveUrl = project.LiveUrl,
            Tags = string.Join(", ", project.Tags)
        };

        Images = project.Images;

        var changelog = await _changelogService.GetForProjectAsync(id);
        if (changelog.IsSuccess) ChangelogEntries = changelog.Value!;

        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();

        var tags = Input.Tags?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
        var result = await _projectService.UpdateAsync(ProjectId, new UpdateProjectRequest(
            Input.Title, Input.Description, Input.Summary, Input.Status,
            Input.IsPublic, Input.SortOrder, Input.RepoUrl, Input.LiveUrl, tags
        ));

        if (!result.IsSuccess) { ErrorMessage = result.Error; return Page(); }
        return RedirectToPage("/Admin/Projects");
    }

    public async Task<IActionResult> OnPostAddEntryAsync(string content, bool isMilestone)
    {
        await _changelogService.AddEntryAsync(ProjectId, new CreateChangelogEntryRequest(content, isMilestone));
        return RedirectToPage(new { id = ProjectId });
    }

    public async Task<IActionResult> OnPostDeleteEntryAsync(Guid entryId)
    {
        await _changelogService.DeleteEntryAsync(entryId);
        return RedirectToPage(new { id = ProjectId });
    }

    public async Task<IActionResult> OnPostUploadImageAsync(IFormFile file, string? altText)
    {
        var uploadResult = await _imageStorage.UploadAsync(file, ProjectId.ToString());
        if (!uploadResult.IsSuccess)
        {
            ErrorMessage = uploadResult.Error;
            return await ReloadPageAsync();
        }

        await _projectService.AddImageAsync(ProjectId, uploadResult.Value!, altText);
        return RedirectToPage(new { id = ProjectId });
    }

    public async Task<IActionResult> OnPostDeleteImageAsync(Guid imageId)
    {
        var imageResult = await _projectService.GetImageAsync(imageId);
        if (imageResult.IsSuccess)
            await _imageStorage.DeleteAsync(imageResult.Value!.Url);

        await _projectService.DeleteImageAsync(imageId);
        return RedirectToPage(new { id = ProjectId });
    }

    private async Task<IActionResult> ReloadPageAsync()
    {
        var result = await _projectService.GetByIdAsync(ProjectId, includeHidden: true);
        if (result.IsSuccess) Images = result.Value!.Images;
        var changelog = await _changelogService.GetForProjectAsync(ProjectId);
        if (changelog.IsSuccess) ChangelogEntries = changelog.Value!;
        return Page();
    }
}
