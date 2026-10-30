import type {
  AuditEntry,
  CommunityDraft,
  DeliveryFormat,
  Facility,
  Submission,
  SubmissionStatus,
  UserAccount,
} from './types'

const TOKEN_KEY = 'azalea-session-token'

export type VolunteerApplication = {
  id: string
  createdAt: string
  firstName: string
  email: string
  stage: string
  interest: string
  motivation: string
  notifyEmail?: string
}

type Cache = {
  user: UserAccount | null
  facilities: Facility[]
  submissions: Submission[]
  volunteerApplications: VolunteerApplication[]
  audit: AuditEntry[]
  draft: CommunityDraft | null
  ready: boolean
  notifyEmail: string
}

const cache: Cache = {
  user: null,
  facilities: [],
  submissions: [],
  volunteerApplications: [],
  audit: [],
  draft: null,
  ready: false,
  notifyEmail: 'celine.zhang@aloft9.com',
}

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export function subscribeStore(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {})
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  let response: Response
  try {
    response = await fetch(path, { ...init, headers })
  } catch {
    throw new Error('Could not reach the Azalea server. Make sure the site is running, then try again.')
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${response.status})`)
  }
  return data as T
}

export function normalizeSubmission(item: Submission): Submission {
  return { ...item, replies: item.replies ?? [] }
}

export async function bootstrapStore() {
  try {
    const data = await api<{
      user: UserAccount | null
      facilities: Facility[]
      submissions: Submission[]
      volunteerApplications?: VolunteerApplication[]
      audit: AuditEntry[]
      draft: CommunityDraft | null
      notifyEmail?: string
    }>('/api/bootstrap')
    cache.user = data.user
    cache.facilities = data.facilities
    cache.submissions = data.submissions.map(normalizeSubmission)
    cache.volunteerApplications = data.volunteerApplications || []
    cache.audit = data.audit || []
    cache.draft = data.draft
    cache.notifyEmail = data.notifyEmail || cache.notifyEmail
    cache.ready = true
    notify()
    return cache
  } catch (error) {
    cache.ready = true
    notify()
    throw error
  }
}

export function getSessionUser(): UserAccount | null {
  return cache.user
}

export function listSubmissions(): Submission[] {
  return cache.submissions
}

export function listAudit(): AuditEntry[] {
  return cache.audit
}

export function listVolunteerApplications(): VolunteerApplication[] {
  return cache.volunteerApplications
}

export async function submitVolunteerApplication(input: {
  firstName: string
  email: string
  stage: string
  interest: string
  motivation: string
}) {
  const data = await api<{
    application: VolunteerApplication
    mailto: string
    notifyEmail: string
  }>('/api/volunteer-applications', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (cache.user?.kind === 'staff') {
    cache.volunteerApplications = [data.application, ...cache.volunteerApplications]
    notify()
  }
  return data
}

export function listFacilities(): Facility[] {
  return cache.facilities
}

export function getCommunityDraft(): CommunityDraft | null {
  return cache.draft
}

export function getSubmissionByTracking(code: string): Submission | null {
  const normalized = code.trim().toUpperCase()
  return cache.submissions.find((item) => item.trackingCode === normalized) ?? null
}

export async function fetchSubmissionByTracking(code: string): Promise<Submission | null> {
  try {
    const data = await api<{ submission: Submission }>(`/api/submissions/track/${encodeURIComponent(code.trim().toUpperCase())}`)
    const submission = normalizeSubmission(data.submission)
    const index = cache.submissions.findIndex((item) => item.id === submission.id)
    if (index >= 0) cache.submissions[index] = submission
    else cache.submissions = [submission, ...cache.submissions]
    notify()
    return submission
  } catch {
    return null
  }
}

export async function loginStaff(email: string, password: string) {
  const data = await api<{ token: string; user: UserAccount }>('/api/auth/staff/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  cache.user = data.user
  await bootstrapStore()
  return data.user
}

export async function registerCommunity(username: string, password: string, displayName: string) {
  const data = await api<{ token: string; user: UserAccount }>('/api/auth/community/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, displayName }),
  })
  setToken(data.token)
  cache.user = data.user
  await bootstrapStore()
  return data.user
}

export async function loginCommunity(username: string, password: string) {
  const data = await api<{ token: string; user: UserAccount; draft: CommunityDraft | null }>('/api/auth/community/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  setToken(data.token)
  cache.user = data.user
  cache.draft = data.draft
  await bootstrapStore()
  return data.user
}

export async function logout() {
  try {
    await api('/api/auth/logout', { method: 'POST', body: '{}' })
  } catch {
    /* ignore */
  }
  setToken(null)
  cache.user = null
  cache.draft = null
  cache.audit = []
  notify()
}

export async function createSubmission(
  input: Omit<
    Submission,
    | 'id'
    | 'trackingCode'
    | 'createdAt'
    | 'updatedAt'
    | 'status'
    | 'rejectReason'
    | 'noteZh'
    | 'reviewedBy'
    | 'translatedBy'
    | 'deliveredBy'
    | 'acknowledgedBy'
    | 'acknowledgedAt'
    | 'facilityId'
    | 'replies'
  >,
): Promise<Submission> {
  const data = await api<{ submission: Submission }>('/api/submissions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  const submission = normalizeSubmission(data.submission)
  cache.submissions = [submission, ...cache.submissions]
  cache.draft = null
  notify()
  return submission
}

export async function updateSubmissionStatus(
  id: string,
  next: SubmissionStatus,
  actorEmail: string,
  extras: Partial<Pick<Submission, 'rejectReason' | 'noteZh' | 'reviewedBy' | 'translatedBy' | 'deliveredBy' | 'acknowledgedBy' | 'acknowledgedAt'>> = {},
): Promise<Submission | null> {
  void actorEmail
  const data = await api<{ submission: Submission }>(`/api/submissions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: next, extras }),
  })
  const submission = normalizeSubmission(data.submission)
  cache.submissions = cache.submissions.map((item) => (item.id === id ? submission : item))
  notify()
  return submission
}

export async function addCaretakerReply(
  submissionId: string,
  actor: { email: string; displayName: string },
  reply: { text: string; imageDataUrl?: string },
): Promise<Submission | null> {
  void actor
  const data = await api<{ submission: Submission }>(`/api/submissions/${submissionId}/replies`, {
    method: 'POST',
    body: JSON.stringify(reply),
  })
  const submission = normalizeSubmission(data.submission)
  cache.submissions = cache.submissions.map((item) => (item.id === submissionId ? submission : item))
  notify()
  return submission
}

export async function setFacilityDeliveryFormat(facilityId: string, deliveryFormat: DeliveryFormat, actorEmail: string) {
  void actorEmail
  const data = await api<{ facility: Facility }>(`/api/facilities/${facilityId}`, {
    method: 'PATCH',
    body: JSON.stringify({ deliveryFormat }),
  })
  cache.facilities = cache.facilities.map((item) => (item.id === facilityId ? data.facility : item))
  notify()
}

export async function saveCommunityDraft(draft: Omit<CommunityDraft, 'updatedAt'>) {
  const data = await api<{ draft: CommunityDraft }>('/api/me/draft', {
    method: 'PUT',
    body: JSON.stringify(draft),
  })
  cache.draft = data.draft
  notify()
  return data.draft
}

/** @deprecated Demo codes removed — staff is a single authorized account. */
export const DEMO_ACCESS_CODES: Record<string, string> = {}

export function revokeUser(_email: string, _actorEmail: string) {
  /* Staff accounts are fixed server-side. */
}

export function restoreDemoUsers(_actorEmail: string) {
  /* Demo staff accounts removed. */
}

export function displaySenderName(name: string, fallback = 'A Bay Area community member') {
  const trimmed = name.trim()
  return trimmed || fallback
}

export function getStoreReady() {
  return cache.ready
}
