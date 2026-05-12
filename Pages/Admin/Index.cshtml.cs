using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Portfolio.Services;

namespace Portfolio.Pages.Admin;

[Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
public class IndexModel : PageModel
{
    private readonly IProjectService _projectService;
    private readonly IMessageService _messageService;

    public IndexModel(IProjectService projectService, IMessageService messageService)
    {
        _projectService = projectService;
        _messageService = messageService;
    }

    public int TotalProjects { get; set; }
    public int PublicProjects { get; set; }
    public int UnreadMessages { get; set; }

    public async Task OnGetAsync()
    {
        var projects = await _projectService.GetAllAsync();
        if (projects.IsSuccess)
        {
            TotalProjects = projects.Value!.Count;
            PublicProjects = projects.Value.Count(p => p.IsPublic);
        }

        var messages = await _messageService.GetAllAsync();
        if (messages.IsSuccess)
            UnreadMessages = messages.Value!.Count(m => !m.IsRead);
    }
}
