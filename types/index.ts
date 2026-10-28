export interface Paged<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export type Role = 'owner' | 'admin' | 'sales' | 'ops' | 'viewer'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: Role
  active: boolean
  mustChangePassword: boolean
  lastLoginAt?: string
  createdAt?: string
}

export type QuoteStatus = 'received' | 'engineering_review' | 'quoted' | 'approved' | 'in_build' | 'shipped' | 'closed' | 'cancelled'

export interface TimelineEvent {
  status: string
  note: string
  at: string
}

export interface InternalNote {
  text: string
  author?: string
  at: string
}

export interface Quote {
  _id: string
  ref: string
  status: QuoteStatus
  priority: 'low' | 'normal' | 'high' | 'urgent'
  value: number
  projectType: string
  projectTypeLabel?: string
  industry?: string
  panelTypes: string[]
  quantity: number
  voltage?: string
  environment?: string
  certifications: string[]
  timeline?: string
  services: string[]
  existingDrawings?: string
  notes?: string
  catalogSlug?: string
  landingPage?: string
  referrer?: string
  utm?: Record<string, string>
  lastContactAt?: string
  name: string
  company?: string
  email: string
  phone?: string
  consent: boolean
  source: string
  tags: string[]
  assignedTo?: { id?: string, name?: string, email?: string }
  internalNotes: InternalNote[]
  followUpAt?: string
  lostReason?: string
  estimate?: { leadTime?: string, reviewBy?: string, confidence?: string, slaHours?: number }
  timelineEvents: TimelineEvent[]
  createdAt: string
  updatedAt: string
}

export interface Message {
  _id: string
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  source: string
  status: 'new' | 'read' | 'replied' | 'archived'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  tags: string[]
  assignedTo?: { id?: string, name?: string, email?: string }
  internalNotes: InternalNote[]
  repliedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Job {
  _id: string
  slug: string
  title: string
  division: string
  location: string
  type: string
  level: string
  summary: string
  responsibilities: string[]
  requirements: string[]
  niceToHave: string[]
  postedAt: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Application {
  _id: string
  jobSlug: string
  jobTitle: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
  resumeUrl: string
  coverLetter: string
  status: 'new' | 'reviewing' | 'interview' | 'offer' | 'hired' | 'rejected'
  rating: number
  tags: string[]
  assignedTo?: { id?: string, name?: string, email?: string }
  internalNotes: InternalNote[]
  createdAt: string
  updatedAt: string
}

export interface ArticleBlock {
  type: 'p' | 'h2' | 'quote' | 'list'
  text?: string
  items?: string[]
}

export interface Article {
  _id: string
  slug: string
  title: string
  excerpt: string
  category: string
  readingTime: number
  publishedAt: string
  author: string
  tone: 'ink' | 'signal' | 'bone'
  body: ArticleBlock[]
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt: string
}

export interface StandardSystem {
  _id: string
  slug: string
  name: string
  category: string
  summary: string
  description?: string
  priceFrom: number
  priceUnit: string
  leadTime: string
  image: string
  specs: { label: string, value: string }[]
  includes: string[]
  active: boolean
  featured: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface MediaAsset {
  _id: string
  key: string
  alt: string
  title?: string
  credit?: string
  sourceUrl?: string
  tags: string[]
  kind: 'bundled' | 'external'
  externalUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Subscriber {
  _id: string
  email: string
  source: string
  status: 'active' | 'unsubscribed'
  createdAt: string
}

export interface AuditLog {
  _id: string
  action: string
  entity: string
  entityId?: string
  summary: string
  actor?: { id?: string, email?: string, name?: string }
  meta?: Record<string, unknown>
  ip?: string
  createdAt: string
}

export interface StatusCount {
  count: number
  value: number
}

export interface Overview {
  generatedAt: string
  rangeDays: number
  quotes: {
    total: number
    status: Record<string, StatusCount>
    newInRange: number
    conversionRate: number
    needsAttention: number
    quotedValue: number
    pipelineValue: number
    recent: Quote[]
  }
  messages: { total: number, unread: number }
  applications: { total: number, new: number }
  jobs: { active: number }
  subscribers: { active: number }
  analytics: {
    eventsInRange: number
    quoteSubmits: number
    contactSubmits: number
    topEvents: { name: string, count: number }[]
    topPages: { path: string, count: number, sessions: number }[]
    sources: { source: string, count: number }[]
    daily: { date: string, views: number, sessions: number }[]
    eventsLast7Days: number
  }
}

export interface AnalyticsSummary {
  rangeDays: number
  daily: { date: string, views: number, sessions: number }[]
  topPages: { path: string, views: number, sessions: number }[]
  topEvents: { name: string, count: number }[]
  sources: { source: string, count: number }[]
  conversions: { sessions: number, quoteViews: number, submissions: number, viewToSubmit: number }
}
