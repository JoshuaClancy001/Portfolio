using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Portfolio.DTOs;
using Portfolio.Services;

namespace Portfolio.Pages;

public class ContactModel : PageModel
{
    private readonly IMessageService _messageService;

    public ContactModel(IMessageService messageService) => _messageService = messageService;

    [BindProperty]
    public ContactInput Input { get; set; } = new();

    public bool Sent { get; set; }
    public string? ErrorMessage { get; set; }

    public void OnGet() { }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid) return Page();

        var result = await _messageService.AddAsync(new CreateMessageRequest(Input.Name, Input.Email, Input.Body));
        if (!result.IsSuccess)
        {
            ErrorMessage = result.Error;
            return Page();
        }

        Sent = true;
        Input = new();
        return Page();
    }

    public class ContactInput
    {
        [Required] public string Name { get; set; } = string.Empty;
        [Required, EmailAddress] public string Email { get; set; } = string.Empty;
        [Required, MinLength(10)] public string Body { get; set; } = string.Empty;
    }
}
