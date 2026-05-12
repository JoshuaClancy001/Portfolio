using Microsoft.EntityFrameworkCore;
using Portfolio.Common;
using Portfolio.Data;
using Portfolio.Domain;
using Portfolio.DTOs;

namespace Portfolio.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _db;

    public ProjectService(AppDbContext db) => _db = db;

    public async Task<Result<List<ProjectResponse>>> GetAllPublicAsync()
    {
        try
        {
            var projects = await _db.Projects
                .Where(p => p.IsPublic)
                .OrderBy(p => p.SortOrder)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .ToListAsync();
            return Result<List<ProjectResponse>>.Ok(projects.Select(MapToResponse).ToList());
        }
        catch { return Result<List<ProjectResponse>>.Fail("Database unavailable."); }
    }

    public async Task<Result<ProjectResponse>> GetByIdAsync(Guid id, bool includeHidden = false)
    {
        try
        {
            var project = await _db.Projects
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .Include(p => p.ChangelogEntries)
                .Include(p => p.Images.OrderBy(i => i.SortOrder))
                .FirstOrDefaultAsync(p => p.Id == id && (includeHidden || p.IsPublic));
            return project is null
                ? Result<ProjectResponse>.Fail("Project not found.")
                : Result<ProjectResponse>.Ok(MapToResponse(project));
        }
        catch { return Result<ProjectResponse>.Fail("Database unavailable."); }
    }

    public async Task<Result<List<ProjectResponse>>> GetAllAsync()
    {
        try
        {
            var projects = await _db.Projects
                .OrderBy(p => p.SortOrder)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .ToListAsync();
            return Result<List<ProjectResponse>>.Ok(projects.Select(MapToResponse).ToList());
        }
        catch { return Result<List<ProjectResponse>>.Fail("Database unavailable."); }
    }

    public async Task<Result<ProjectResponse>> CreateAsync(CreateProjectRequest request)
    {
        if (!Enum.TryParse<ProjectStatus>(request.Status, out var status))
            return Result<ProjectResponse>.Fail($"Invalid status: {request.Status}");

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Summary = request.Summary,
            Status = status,
            IsPublic = request.IsPublic,
            SortOrder = request.SortOrder,
            RepoUrl = request.RepoUrl,
            LiveUrl = request.LiveUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Projects.Add(project);

        if (request.Tags?.Count > 0)
            await AttachTagsAsync(project.Id, request.Tags);

        await _db.SaveChangesAsync();

        return Result<ProjectResponse>.Ok(await ReloadWithTagsAsync(project.Id));
    }

    public async Task<Result<ProjectResponse>> UpdateAsync(Guid id, UpdateProjectRequest request)
    {
        var project = await _db.Projects
            .Include(p => p.ProjectTags)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null)
            return Result<ProjectResponse>.Fail("Project not found.");

        if (!Enum.TryParse<ProjectStatus>(request.Status, out var status))
            return Result<ProjectResponse>.Fail($"Invalid status: {request.Status}");

        project.Title = request.Title;
        project.Description = request.Description;
        project.Summary = request.Summary;
        project.Status = status;
        project.IsPublic = request.IsPublic;
        project.SortOrder = request.SortOrder;
        project.RepoUrl = request.RepoUrl;
        project.LiveUrl = request.LiveUrl;
        project.UpdatedAt = DateTime.UtcNow;

        _db.ProjectTags.RemoveRange(project.ProjectTags);

        if (request.Tags?.Count > 0)
            await AttachTagsAsync(project.Id, request.Tags);

        await _db.SaveChangesAsync();

        return Result<ProjectResponse>.Ok(await ReloadWithTagsAsync(project.Id));
    }

    public async Task<Result> DeleteAsync(Guid id)
    {
        var project = await _db.Projects.FindAsync(id);
        if (project is null) return Result.Fail("Project not found.");

        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();
        return Result.Ok();
    }

    public async Task<Result<ProjectResponse>> UpdateStatusAsync(Guid id, string statusStr)
    {
        var project = await _db.Projects
            .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null) return Result<ProjectResponse>.Fail("Project not found.");

        if (!Enum.TryParse<ProjectStatus>(statusStr, out var status))
            return Result<ProjectResponse>.Fail($"Invalid status: {statusStr}");

        project.Status = status;
        project.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Result<ProjectResponse>.Ok(MapToResponse(project));
    }

    public async Task<Result<ProjectResponse>> UpdateVisibilityAsync(Guid id, bool isPublic)
    {
        var project = await _db.Projects
            .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project is null) return Result<ProjectResponse>.Fail("Project not found.");

        project.IsPublic = isPublic;
        project.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Result<ProjectResponse>.Ok(MapToResponse(project));
    }

    public async Task<Result> ReorderAsync(List<Guid> orderedIds)
    {
        var projects = await _db.Projects
            .Where(p => orderedIds.Contains(p.Id))
            .ToListAsync();

        for (int i = 0; i < orderedIds.Count; i++)
        {
            var project = projects.FirstOrDefault(p => p.Id == orderedIds[i]);
            if (project is not null) project.SortOrder = i + 1;
        }

        await _db.SaveChangesAsync();
        return Result.Ok();
    }

    public async Task<Result<ProjectImageResponse>> AddImageAsync(Guid projectId, string url, string? altText)
    {
        var nextOrder = await _db.ProjectImages
            .Where(i => i.ProjectId == projectId)
            .CountAsync();

        var image = new ProjectImage
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Url = url,
            AltText = altText,
            SortOrder = nextOrder,
            CreatedAt = DateTime.UtcNow
        };

        _db.ProjectImages.Add(image);
        await _db.SaveChangesAsync();

        return Result<ProjectImageResponse>.Ok(new ProjectImageResponse(image.Id, image.Url, image.AltText, image.SortOrder));
    }

    public async Task<Result<ProjectImage>> GetImageAsync(Guid imageId)
    {
        var image = await _db.ProjectImages.FindAsync(imageId);
        return image is null
            ? Result<ProjectImage>.Fail("Image not found.")
            : Result<ProjectImage>.Ok(image);
    }

    public async Task<Result> DeleteImageAsync(Guid imageId)
    {
        var image = await _db.ProjectImages.FindAsync(imageId);
        if (image is null) return Result.Fail("Image not found.");

        _db.ProjectImages.Remove(image);
        await _db.SaveChangesAsync();
        return Result.Ok();
    }

    private async Task AttachTagsAsync(Guid projectId, List<string> tagNames)
    {
        foreach (var name in tagNames)
        {
            var trimmed = name.Trim();
            if (string.IsNullOrEmpty(trimmed)) continue;

            var tag = await _db.Tags.FirstOrDefaultAsync(t => t.Name == trimmed);
            if (tag is null)
            {
                tag = new Tag { Id = Guid.NewGuid(), Name = trimmed };
                _db.Tags.Add(tag);
            }
            _db.ProjectTags.Add(new ProjectTag { ProjectId = projectId, TagId = tag.Id });
        }
    }

    private async Task<ProjectResponse> ReloadWithTagsAsync(Guid id)
    {
        var project = await _db.Projects
            .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
            .Include(p => p.Images.OrderBy(i => i.SortOrder))
            .FirstAsync(p => p.Id == id);
        return MapToResponse(project);
    }

    private static ProjectResponse MapToResponse(Project p) => new(
        p.Id,
        p.Title,
        p.Description,
        p.Summary,
        p.Status.ToString(),
        p.IsPublic,
        p.SortOrder,
        p.RepoUrl,
        p.LiveUrl,
        p.CreatedAt,
        p.UpdatedAt,
        p.ProjectTags.Select(pt => pt.Tag.Name).ToList(),
        p.Images.Select(i => new ProjectImageResponse(i.Id, i.Url, i.AltText, i.SortOrder)).ToList()
    );
}
