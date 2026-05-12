-- Portfolio database schema
-- Run this once against your Supabase / PostgreSQL database
-- before starting the app for the first time.

CREATE TABLE IF NOT EXISTS "Projects" (
    "Id"          UUID          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "Title"       TEXT          NOT NULL,
    "Description" TEXT          NOT NULL DEFAULT '',
    "Status"      TEXT          NOT NULL DEFAULT 'Planned',  -- Planned | InProgress | Shipped | Paused
    "IsPublic"    BOOLEAN       NOT NULL DEFAULT FALSE,
    "SortOrder"   INTEGER       NOT NULL DEFAULT 0,
    "RepoUrl"     TEXT,
    "LiveUrl"     TEXT,
    "CreatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    "UpdatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Tags" (
    "Id"   UUID  NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "Name" TEXT  NOT NULL,
    CONSTRAINT "UQ_Tags_Name" UNIQUE ("Name")
);

CREATE TABLE IF NOT EXISTS "ProjectTags" (
    "ProjectId" UUID NOT NULL REFERENCES "Projects" ("Id") ON DELETE CASCADE,
    "TagId"     UUID NOT NULL REFERENCES "Tags"     ("Id") ON DELETE CASCADE,
    PRIMARY KEY ("ProjectId", "TagId")
);

CREATE TABLE IF NOT EXISTS "ChangelogEntries" (
    "Id"          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "ProjectId"   UUID        NOT NULL REFERENCES "Projects" ("Id") ON DELETE CASCADE,
    "Content"     TEXT        NOT NULL,
    "IsMilestone" BOOLEAN     NOT NULL DEFAULT FALSE,
    "CreatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Messages" (
    "Id"        UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "Name"      TEXT        NOT NULL,
    "Email"     TEXT        NOT NULL,
    "Body"      TEXT        NOT NULL,
    "IsRead"    BOOLEAN     NOT NULL DEFAULT FALSE,
    "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- EF Core migrations tracking table (lets you use dotnet ef migrations later)
CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId"    VARCHAR(150) NOT NULL PRIMARY KEY,
    "ProductVersion" VARCHAR(32)  NOT NULL
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- The app connects as the postgres superuser (connection string), which
-- bypasses RLS entirely. These policies protect the tables if the Supabase
-- REST API (anon/authenticated roles) or the Supabase dashboard ever touches
-- them directly.
-- ---------------------------------------------------------------------------

ALTER TABLE "Projects"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tags"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProjectTags"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChangelogEntries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Messages"        ENABLE ROW LEVEL SECURITY;

-- service_role (used by Supabase server-side clients) gets full access
CREATE POLICY "service_all_projects"        ON "Projects"         FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_tags"            ON "Tags"             FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_project_tags"    ON "ProjectTags"      FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_changelog"       ON "ChangelogEntries" FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_messages"        ON "Messages"         FOR ALL TO service_role USING (true) WITH CHECK (true);

-- anon (unauthenticated): read public projects only
CREATE POLICY "anon_read_projects" ON "Projects"
    FOR SELECT TO anon
    USING ("IsPublic" = true);

-- anon: read tags (needed to display tags on public project cards)
CREATE POLICY "anon_read_tags" ON "Tags"
    FOR SELECT TO anon
    USING (true);

-- anon: read project-tag links for public projects only
CREATE POLICY "anon_read_project_tags" ON "ProjectTags"
    FOR SELECT TO anon
    USING (
        EXISTS (
            SELECT 1 FROM "Projects" p
            WHERE p."Id" = "ProjectId" AND p."IsPublic" = true
        )
    );

-- anon: read changelog entries for public projects only
CREATE POLICY "anon_read_changelog" ON "ChangelogEntries"
    FOR SELECT TO anon
    USING (
        EXISTS (
            SELECT 1 FROM "Projects" p
            WHERE p."Id" = "ProjectId" AND p."IsPublic" = true
        )
    );

-- anon: insert messages (contact form) — no read access
CREATE POLICY "anon_insert_messages" ON "Messages"
    FOR INSERT TO anon
    WITH CHECK (true);
