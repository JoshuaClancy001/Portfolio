using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Portfolio.DTOs;
using Portfolio.Services;

namespace Portfolio.Pages.Admin;

[Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
public class MessagesModel : PageModel
{
    private readonly IMessageService _messageService;

    public MessagesModel(IMessageService messageService) => _messageService = messageService;

    public List<MessageResponse> Messages { get; set; } = [];

    public async Task OnGetAsync()
    {
        var result = await _messageService.GetAllAsync();
        if (result.IsSuccess) Messages = result.Value!;
    }

    public async Task<IActionResult> OnPostMarkReadAsync(Guid id)
    {
        await _messageService.MarkReadAsync(id);
        return RedirectToPage();
    }
}
