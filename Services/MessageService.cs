using Microsoft.EntityFrameworkCore;
using Portfolio.Common;
using Portfolio.Data;
using Portfolio.Domain;
using Portfolio.DTOs;

namespace Portfolio.Services;

public class MessageService : IMessageService
{
    private readonly AppDbContext _db;

    public MessageService(AppDbContext db) => _db = db;

    public async Task<Result<List<MessageResponse>>> GetAllAsync()
    {
        try
        {
            var messages = await _db.Messages
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
            return Result<List<MessageResponse>>.Ok(messages.Select(MapToResponse).ToList());
        }
        catch { return Result<List<MessageResponse>>.Fail("Database unavailable."); }
    }

    public async Task<Result> AddAsync(CreateMessageRequest request)
    {
        _db.Messages.Add(new Message
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            Body = request.Body,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Result.Ok();
    }

    public async Task<Result> MarkReadAsync(Guid id)
    {
        var message = await _db.Messages.FindAsync(id);
        if (message is null) return Result.Fail("Message not found.");

        message.IsRead = true;
        await _db.SaveChangesAsync();
        return Result.Ok();
    }

    private static MessageResponse MapToResponse(Message m) =>
        new(m.Id, m.Name, m.Email, m.Body, m.IsRead, m.CreatedAt);
}
