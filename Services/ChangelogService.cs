using Microsoft.EntityFrameworkCore;
using Portfolio.Common;
using Portfolio.Data;
using Portfolio.Domain;
using Portfolio.DTOs;

namespace Portfolio.Services;

public class ChangelogService : IChangelogService
{
    private readonly AppDbContext _db;

    public ChangelogService(AppDbContext db) => _db = db;

    public async Task<Result<List<ChangelogEntryResponse>>> GetForProjectAsync(Guid projectId)
    {
        try
        {
            var entries = await _db.ChangelogEntries
                .Where(e => e.ProjectId == projectId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
            return Result<List<ChangelogEntryResponse>>.Ok(entries.Select(MapToResponse).ToList());
        }
        catch { return Result<List<ChangelogEntryResponse>>.Fail("Database unavailable."); }
    }

    public async Task<Result<ChangelogEntryResponse>> AddEntryAsync(Guid projectId, CreateChangelogEntryRequest request)
    {
        if (!await _db.Projects.AnyAsync(p => p.Id == projectId))
            return Result<ChangelogEntryResponse>.Fail("Project not found.");

        var entry = new ChangelogEntry
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Content = request.Content,
            IsMilestone = request.IsMilestone,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.ChangelogEntries.Add(entry);
        await _db.SaveChangesAsync();

        return Result<ChangelogEntryResponse>.Ok(MapToResponse(entry));
    }

    public async Task<Result<ChangelogEntryResponse>> UpdateEntryAsync(Guid entryId, UpdateChangelogEntryRequest request)
    {
        var entry = await _db.ChangelogEntries.FindAsync(entryId);
        if (entry is null) return Result<ChangelogEntryResponse>.Fail("Entry not found.");

        entry.Content = request.Content;
        entry.IsMilestone = request.IsMilestone;
        if (request.EntryDate.HasValue)
            entry.CreatedAt = request.EntryDate.Value;
        entry.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Result<ChangelogEntryResponse>.Ok(MapToResponse(entry));
    }

    public async Task<Result> DeleteEntryAsync(Guid entryId)
    {
        var entry = await _db.ChangelogEntries.FindAsync(entryId);
        if (entry is null) return Result.Fail("Entry not found.");

        _db.ChangelogEntries.Remove(entry);
        await _db.SaveChangesAsync();
        return Result.Ok();
    }

    private static ChangelogEntryResponse MapToResponse(ChangelogEntry e) =>
        new(e.Id, e.ProjectId, e.Content, e.IsMilestone, e.CreatedAt, e.UpdatedAt);
}
