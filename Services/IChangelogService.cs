using Portfolio.Common;
using Portfolio.DTOs;

namespace Portfolio.Services;

public interface IChangelogService
{
    Task<Result<List<ChangelogEntryResponse>>> GetForProjectAsync(Guid projectId);
    Task<Result<ChangelogEntryResponse>> AddEntryAsync(Guid projectId, CreateChangelogEntryRequest request);
    Task<Result<ChangelogEntryResponse>> UpdateEntryAsync(Guid entryId, UpdateChangelogEntryRequest request);
    Task<Result> DeleteEntryAsync(Guid entryId);
}
