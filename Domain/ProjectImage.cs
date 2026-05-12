namespace Portfolio.Domain;

public class ProjectImage
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }

    public Project Project { get; set; } = null!;
}
