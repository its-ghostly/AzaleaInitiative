export type StaffRole = 'super_admin' | 'volunteer' | 'caretaker'
export type UserRole = StaffRole | 'sender'

export type SubmissionStatus =
  | 'received'
  | 'needs_guardian'
  | 'in_review'
  | 'rejected'
  | 'reviewed'
  | 'translated'
  | 'delivered'
  | 'acknowledged'

export type AgeBand = 'under_13' | '13_17' | '18_plus' | 'prefer_not'

export type FacilityId = 'hysiang-yuan'

export type DeliveryFormat = 'digital_inbox' | 'print_packet' | 'slideshow'

export interface Facility {
  id: FacilityId
  name: string
  deliveryFormat: DeliveryFormat
}

export interface UserAccount {
  id: string
  email: string
  username?: string
  displayName: string
  role: UserRole
  facilityId?: FacilityId
  active: boolean
  kind?: 'staff' | 'community'
}

export interface AuditEntry {
  id: string
  at: string
  actorEmail: string
  action: string
  submissionId?: string
  detail?: string
}

export interface CaretakerReply {
  id: string
  at: string
  authorEmail: string
  authorName: string
  text: string
  imageDataUrl: string
}

export interface Submission {
  id: string
  trackingCode: string
  createdAt: string
  updatedAt: string
  imageDataUrl: string
  senderName: string
  note: string
  noteZh: string
  locale: 'en' | 'zh'
  ageBand: AgeBand
  guardianEmail: string
  consentDelivery: boolean
  consentGallery: boolean
  status: SubmissionStatus
  rejectReason: string
  facilityId: FacilityId
  reviewedBy: string
  translatedBy: string
  deliveredBy: string
  acknowledgedBy: string
  acknowledgedAt: string
  replies: CaretakerReply[]
  ownerUsername?: string
}

export interface CommunityDraft {
  image: string
  senderName: string
  locale: 'en' | 'zh'
  consentGallery: boolean
  updatedAt: string
}

export interface PlatformState {
  users: UserAccount[]
  facilities: Facility[]
  submissions: Submission[]
  audit: AuditEntry[]
  sessionEmail: string | null
}
