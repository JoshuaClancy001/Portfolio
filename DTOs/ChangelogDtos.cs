namespace Portfolio.DTOs;

public record ChangelogEntryResponse(
    Guid Id,
    Guid ProjectId,
    string Content,
    bool IsMilestone,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateChangelogEntryRequest(
    string Content,
    bool IsMilestone = false
);

public record UpdateChangelogEntryRequest(
    string Content,
    bool IsMilestone,
    DateTime? EntryDate
);
