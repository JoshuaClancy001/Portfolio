export type ProjectStatus = 'Planned' | 'InProgress' | 'Shipped' | 'Paused'

export interface Tag {
  Id: string
  Name: string
}

export interface ProjectImage {
  Id: string
  ProjectId: string
  Url: string
  AltText: string | null
  SortOrder: number
  CreatedAt: string
}

export interface ChangelogEntry {
  Id: string
  ProjectId: string
  Content: string
  IsMilestone: boolean
  CreatedAt: string
  UpdatedAt: string
}

export interface Project {
  Id: string
  Title: string
  Description: string
  Summary: string | null
  Status: ProjectStatus
  IsPublic: boolean
  SortOrder: number
  RepoUrl: string | null
  LiveUrl: string | null
  TargetDate: string | null
  CreatedAt: string
  UpdatedAt: string
  tags: Tag[]
  images: ProjectImage[]
}

export interface Message {
  Id: string
  Name: string
  Email: string
  Body: string
  IsRead: boolean
  CreatedAt: string
}
