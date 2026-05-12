namespace Portfolio.DTOs;

public record ProjectImageResponse(Guid Id, string Url, string? AltText, int SortOrder);

public record ProjectResponse(
    Guid Id,
    string Title,
    string Description,
    string? Summary,
    string Status,
    bool IsPublic,
    int SortOrder,
    string? RepoUrl,
    string? LiveUrl,
    DateTime? TargetDate,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<string> Tags,
    List<ProjectImageResponse> Images
);

public record CreateProjectRequest(
    string Title,
    string Description,
    string? Summary,
    string Status,
    bool IsPublic,
    int SortOrder,
    string? RepoUrl,
    string? LiveUrl,
    DateTime? TargetDate,
    List<string>? Tags
);

public record UpdateProjectRequest(
    string Title,
    string Description,
    string? Summary,
    string Status,
    bool IsPublic,
    int SortOrder,
    string? RepoUrl,
    string? LiveUrl,
    DateTime? TargetDate,
    List<string>? Tags
);

public record UpdateStatusRequest(string Status);
public record UpdateVisibilityRequest(bool IsPublic);
public record ReorderRequest(List<Guid> OrderedIds);
