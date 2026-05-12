namespace Portfolio.DTOs;

public record MessageResponse(
    Guid Id,
    string Name,
    string Email,
    string Body,
    bool IsRead,
    DateTime CreatedAt
);

public record CreateMessageRequest(
    string Name,
    string Email,
    string Body
);
