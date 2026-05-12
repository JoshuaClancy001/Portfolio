namespace Portfolio.Domain;

public class Project
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ProjectStatus Status { get; set; }
    public bool IsPublic { get; set; }
    public int SortOrder { get; set; }
    public string? RepoUrl { get; set; }
    public string? LiveUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<ChangelogEntry> ChangelogEntries { get; set; } = [];
    public ICollection<ProjectTag> ProjectTags { get; set; } = [];
}
