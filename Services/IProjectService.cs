using Portfolio.Common;
using Portfolio.DTOs;

namespace Portfolio.Services;

public interface IProjectService
{
    Task<Result<List<ProjectResponse>>> GetAllPublicAsync();
    Task<Result<ProjectResponse>> GetByIdAsync(Guid id, bool includeHidden = false);
    Task<Result<List<ProjectResponse>>> GetAllAsync();
    Task<Result<ProjectResponse>> CreateAsync(CreateProjectRequest request);
    Task<Result<ProjectResponse>> UpdateAsync(Guid id, UpdateProjectRequest request);
    Task<Result> DeleteAsync(Guid id);
    Task<Result<ProjectResponse>> UpdateStatusAsync(Guid id, string status);
    Task<Result<ProjectResponse>> UpdateVisibilityAsync(Guid id, bool isPublic);
    Task<Result> ReorderAsync(List<Guid> orderedIds);
}
