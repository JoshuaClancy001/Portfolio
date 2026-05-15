import type { ProjectStatus } from './types'

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  Planned: 'var(--status-planned)',
  InProgress: 'var(--status-inprogress)',
  Shipped: 'var(--status-shipped)',
  Paused: 'var(--status-paused)',
}

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  Planned: 'Planned',
  InProgress: 'In Progress',
  Shipped: 'Shipped',
  Paused: 'Paused',
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
