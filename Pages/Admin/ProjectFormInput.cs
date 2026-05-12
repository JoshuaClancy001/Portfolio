using System.ComponentModel.DataAnnotations;

namespace Portfolio.Pages.Admin;

public class ProjectFormInput
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Description { get; set; } = string.Empty;
    public string? Summary { get; set; }
    [Required] public string Status { get; set; } = "Planned";
    public bool IsPublic { get; set; }
    public int SortOrder { get; set; } = 99;
    public string? RepoUrl { get; set; }
    public string? LiveUrl { get; set; }
    public string? Tags { get; set; }
}
