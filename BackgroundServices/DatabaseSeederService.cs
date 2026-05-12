using Microsoft.EntityFrameworkCore;
using Portfolio.Data;
using Portfolio.Domain;

namespace Portfolio.BackgroundServices;

// BackgroundService runs outside the request pipeline, so AppDbContext (which is Scoped) cannot
// be injected directly into the constructor. IServiceScopeFactory lets us create a scope manually
// and pull the DbContext from it — the standard pattern for IHostedService + EF Core.
public class DatabaseSeederService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DatabaseSeederService> _logger;

    public DatabaseSeederService(IServiceScopeFactory scopeFactory, ILogger<DatabaseSeederService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            await db.Database.MigrateAsync(stoppingToken);

            if (!await db.Projects.AnyAsync(stoppingToken))
                await SeedAsync(db, stoppingToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Database seeder skipped — set DATABASE_URL to connect.");
        }
    }

    private async Task SeedAsync(AppDbContext db, CancellationToken ct)
    {
        var tagNames = new[] { "ASP.NET Core", "C#", "PostgreSQL", "EF Core", "JWT", "Razor Pages" };
        var tags = tagNames.Select(name => new Tag { Id = Guid.NewGuid(), Name = name }).ToList();
        db.Tags.AddRange(tags);

        var project = new Project
        {
            Id = Guid.NewGuid(),
            Title = "Portfolio & Project Tracker",
            Description = "This site — built with ASP.NET Core, Razor Pages, EF Core, and PostgreSQL. Documents its own construction on the Roadmap page.",
            Status = ProjectStatus.InProgress,
            IsPublic = true,
            SortOrder = 1,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Projects.Add(project);
        db.ProjectTags.AddRange(tags.Select(t => new ProjectTag { ProjectId = project.Id, TagId = t.Id }));

        db.ChangelogEntries.Add(new ChangelogEntry
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            Content = "Project initialized. ASP.NET Core web app scaffolded with Razor Pages, EF Core, and PostgreSQL. Deployment pipeline set up with Railway and Supabase.",
            IsMilestone = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync(ct);
        _logger.LogInformation("Database seeded with initial portfolio project.");
    }
}
