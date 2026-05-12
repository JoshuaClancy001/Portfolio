namespace Portfolio.DTOs;

public record ProjectResponse(
    Guid Id,
    string Title,
    string Description,
    string Status,
    bool IsPublic,
    int SortOrder,
    string? RepoUrl,
    string? LiveUrl,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<string> Tags
);

public record CreateProjectRequest(
    string Title,
    string Description,
    string Status,
    bool IsPublic,
    int SortOrder,
    string? RepoUrl,
    string? LiveUrl,
    List<string>? Tags
);

public record UpdateProjectRequest(
    string Title,
    string Description,
    string Status,
    bool IsPublic,
    int SortOrder,
    string? RepoUrl,
    string? LiveUrl,
    List<string>? Tags
);

public record UpdateStatusRequest(string Status);
public record UpdateVisibilityRequest(bool IsPublic);
public record ReorderRequest(List<Guid> OrderedIds);
