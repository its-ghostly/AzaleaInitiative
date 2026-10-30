import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { ArrowRight, Check, LogOut, ShieldCheck, Sparkles, Users } from 'lucide-react'
import {
  addCaretakerReply,
  displaySenderName,
  fetchSubmissionByTracking,
  getSessionUser,
  listAudit,
  listFacilities,
  listSubmissions,
  listVolunteerApplications,
  loginStaff,
  logout,
  setFacilityDeliveryFormat,
  subscribeStore,
  updateSubmissionStatus,
} from '../platform/store'
import type { DeliveryFormat, Submission, UserAccount } from '../platform/types'
import { useLanguage } from '../i18n/LanguageContext'

function refreshTick(setter: Dispatch<SetStateAction<number>>) {
  setter((value) => value + 1)
}

function StaffWorkspace() {
  const [tick, setTick] = useState(0)
  const session = getSessionUser()
  void tick
  const [email, setEmail] = useState('celine.zhang@aloft9.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [noteZh, setNoteZh] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [tagQuery, setTagQuery] = useState('')
  const [tagError, setTagError] = useState('')
  const [staffTab, setStaffTab] = useState<'workspace' | 'gallery'>('workspace')
  const { t } = useLanguage()

  useEffect(() => subscribeStore(() => refreshTick(setTick)), [])

  const allSubs = listSubmissions()
  const audit = listAudit()
  const facilities = listFacilities()
  const staffSession = session?.kind === 'staff' ? session : null
  const selected = allSubs.find((item) => item.id === selectedId) ?? allSubs[0] ?? null

  const lookupTag = async (event: FormEvent) => {
    event.preventDefault()
    const match = await fetchSubmissionByTracking(tagQuery)
    if (!match) {
      setTagError('No submission found for that tag ID.')
      return
    }
    setTagError('')
    setSelectedId(match.id)
    refreshTick(setTick)
  }

  const login = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await loginStaff(email, password)
      refreshTick(setTick)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }

  const signOut = async () => {
    await logout()
    refreshTick(setTick)
  }

  const act = async (action: () => void | Promise<void>) => {
    await action()
    refreshTick(setTick)
  }

  if (!staffSession) {
    return (
      <section className="staff-section" id="staff">
        <div className="staff-login card-panel">
          <span className="eyebrow"><ShieldCheck size={14} /> {t('staff.login.eyebrow')}</span>
          <h2>{t('staff.login.title')}</h2>
          <p>{t('staff.login.body')}</p>
          <form onSubmit={login} className="staff-login-form">
            <label>{t('staff.login.email')}<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>{t('staff.login.password')}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {error && <p className="form-error">{error}</p>}
            <button className="button primary" type="submit" disabled={busy}>{t('staff.login.submit')} <ArrowRight size={17} /></button>
          </form>
        </div>
      </section>
    )
  }

  return (
    <section className={`staff-section${staffTab === 'gallery' ? ' staff-section-gallery' : ''}`} id="staff">
      <header className="staff-topbar">
        <div>
          <span className="eyebrow">{t('staff.signedInAs', { role: staffSession.role.replaceAll('_', ' ') })}</span>
          <h2>{staffSession.displayName}</h2>
          <p>{staffSession.email}{staffSession.facilityId ? ` · ${staffSession.facilityId}` : ''}</p>
          <div className="staff-tabs" role="tablist" aria-label="Staff areas">
            <button
              type="button"
              role="tab"
              aria-selected={staffTab === 'workspace'}
              className={staffTab === 'workspace' ? 'active' : ''}
              onClick={() => setStaffTab('workspace')}
            >
              {t('staff.tab.workspace')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={staffTab === 'gallery'}
              className={staffTab === 'gallery' ? 'active' : ''}
              onClick={() => setStaffTab('gallery')}
            >
              {t('staff.tab.gallery')}
            </button>
          </div>
        </div>
        <div className="staff-topbar-actions">
          {staffTab === 'workspace' && (
            <form className="staff-tag-lookup" onSubmit={lookupTag}>
              <label>
                {t('staff.tagId')}
                <input
                  value={tagQuery}
                  onChange={(event) => setTagQuery(event.target.value.toUpperCase())}
                  placeholder="AZ-XXXX-XXXX"
                  aria-label="Look up submission by tag ID"
                />
              </label>
              <button className="button ghost small" type="submit">{t('staff.find')}</button>
            </form>
          )}
          {tagError && staffTab === 'workspace' && <p className="form-error staff-tag-error">{tagError}</p>}
          <button className="button ghost" onClick={() => void signOut()}><LogOut size={16} /> {t('auth.signOut')}</button>
        </div>
      </header>

      {staffTab === 'workspace' ? (
        <>
          <VolunteerApplicationsPanel />
          <VolunteerQueue
            user={staffSession}
            submissions={allSubs}
            selected={selected}
            onSelect={setSelectedId}
            noteZh={noteZh}
            setNoteZh={setNoteZh}
            rejectReason={rejectReason}
            setRejectReason={setRejectReason}
            onAct={act}
          />
          <CaretakerInbox user={staffSession} submissions={allSubs} onAct={act} />
          <SuperAdminPanel facilities={facilities} audit={audit} onAct={act} actorEmail={staffSession.email} />
        </>
      ) : (
        <StaffGallery submissions={allSubs} />
      )}
    </section>
  )
}

function VolunteerApplicationsPanel() {
  const { t } = useLanguage()
  const applications = listVolunteerApplications()
  return (
    <div className="staff-panel">
      <div className="staff-panel-heading">
        <Users size={18} />
        <div>
          <h3>{t('staff.apps.title')}</h3>
          <p>{t('staff.apps.body')}</p>
        </div>
      </div>
      {applications.length === 0 ? (
        <p className="empty-note">{t('staff.apps.empty')}</p>
      ) : (
        <div className="application-inbox">
          {applications.map((item) => (
            <article key={item.id} className="application-card">
              <p className="eyebrow">{new Date(item.createdAt).toLocaleString()}</p>
              <h4>{item.firstName}</h4>
              <p><a href={`mailto:${item.email}`}>{item.email}</a></p>
              <p><strong>{t('staff.apps.stage')}</strong> {item.stage}</p>
              <p><strong>{t('staff.apps.interest')}</strong> {item.interest}</p>
              <p>{item.motivation}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function StaffGallery({ submissions }: { submissions: Submission[] }) {
  const { t } = useLanguage()
  const sorted = [...submissions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  const mats = ['staff-art-sun', 'staff-art-sky', 'staff-art-bloom']

  return (
    <div className="staff-gallery-view">
      <div className="section-heading inline">
        <div>
          <span className="eyebrow">{t('staff.gallery.eyebrow')}</span>
          <h2 dangerouslySetInnerHTML={{ __html: t('staff.gallery.title') }} />
        </div>
        <p>{t('staff.gallery.body')}</p>
      </div>

      {sorted.length === 0 ? (
        <p className="staff-gallery-empty">{t('staff.gallery.empty')}</p>
      ) : (
        <div className="gallery-row staff-gallery-row" aria-label={t('staff.tab.gallery')}>
          {sorted.map((item, index) => (
            <article key={item.id} className={`art-card ${mats[index % mats.length]}`}>
              <div className="staff-art-frame">
                <img src={item.imageDataUrl} alt="" />
              </div>
              <p>{displaySenderName(item.senderName, t('sender.anonymous'))}</p>
              <small>{item.note?.trim() || new Date(item.createdAt).toLocaleDateString()}</small>
            </article>
          ))}
        </div>
      )}

      <p className="gallery-caption"><Sparkles size={15} /> {t('staff.gallery.caption')}</p>
    </div>
  )
}

function VolunteerQueue({
  user,
  submissions,
  selected,
  onSelect,
  noteZh,
  setNoteZh,
  rejectReason,
  setRejectReason,
  onAct,
}: {
  user: UserAccount
  submissions: Submission[]
  selected: Submission | null
  onSelect: (id: string) => void
  noteZh: string
  setNoteZh: (value: string) => void
  rejectReason: string
  setRejectReason: (value: string) => void
  onAct: (action: () => void | Promise<void>) => void | Promise<void>
}) {
  const { t } = useLanguage()
  const run = (action: () => Promise<unknown>) => void onAct(async () => { await action() })
  const queue = submissions.filter((item) =>
    ['received', 'needs_guardian', 'in_review', 'reviewed', 'translated'].includes(item.status),
  )

  return (
    <div className="staff-panel">
      <div className="staff-panel-heading">
        <Users size={18} />
        <div>
          <h3>{t('staff.queue.title')}</h3>
          <p>{t('staff.queue.body')}</p>
        </div>
      </div>
      <div className="staff-grid">
        <div className="queue-list">
          {queue.length === 0 && <p className="empty-note">{t('staff.queue.empty')}</p>}
          {queue.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`queue-item ${selected?.id === item.id ? 'active' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <span className="tag-id-label">{t('staff.tagId')}</span>
              <strong className="tag-id">{item.trackingCode}</strong>
              <span>{item.status.replaceAll('_', ' ')}</span>
              <small>{displaySenderName(item.senderName)} · {new Date(item.createdAt).toLocaleString()}</small>
            </button>
          ))}
        </div>
        {selected && (
          <div className="queue-detail">
            <img src={selected.imageDataUrl} alt="Submission artwork" />
            <div className="queue-meta">
              <p className="tag-id-row"><strong>Tag ID:</strong> <code className="tag-id">{selected.trackingCode}</code></p>
              <p><strong>From:</strong> {displaySenderName(selected.senderName)}</p>
              {selected.note ? <p><strong>Note:</strong> {selected.note}</p> : null}
              <p><strong>Status:</strong> {selected.status.replaceAll('_', ' ')}</p>
              {selected.noteZh && <p><strong>繁中:</strong> {selected.noteZh}</p>}
            </div>
            <div className="queue-actions">
              <button
                className="button primary small"
                onClick={() => run(() => updateSubmissionStatus(selected.id, 'reviewed', user.email, { reviewedBy: user.email }))}
              >
                Approve
              </button>
              <label>
                Reject reason
                <input value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="Kind explanation" />
              </label>
              <button
                className="button ghost small"
                onClick={() => run(() => updateSubmissionStatus(selected.id, 'rejected', user.email, { rejectReason, reviewedBy: user.email }))}
              >
                Reject
              </button>
              <label>
                Traditional Chinese translation
                <textarea value={noteZh} onChange={(event) => setNoteZh(event.target.value)} rows={3} placeholder="翻譯短訊…" />
              </label>
              <button
                className="button ghost small"
                onClick={() => run(() => updateSubmissionStatus(selected.id, 'translated', user.email, { noteZh, translatedBy: user.email }))}
              >
                Save translation
              </button>
              <button
                className="button primary small"
                onClick={() => run(() => updateSubmissionStatus(selected.id, 'delivered', user.email, { deliveredBy: user.email }))}
              >
                Mark delivered to facility
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CaretakerInbox({
  user,
  submissions,
  onAct,
}: {
  user: UserAccount
  submissions: Submission[]
  onAct: (action: () => void | Promise<void>) => void | Promise<void>
}) {
  const { t } = useLanguage()
  const run = (action: () => Promise<unknown>) => void onAct(async () => { await action() })
  const facilityId = user.facilityId ?? 'hysiang-yuan'
  const inbox = submissions.filter(
    (item) => item.facilityId === facilityId && item.status === 'delivered',
  )
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replyImage, setReplyImage] = useState<Record<string, string>>({})

  const onPickImage = (id: string, file: File | null) => {
    if (!file) {
      setReplyImage((current) => ({ ...current, [id]: '' }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setReplyImage((current) => ({ ...current, [id]: String(reader.result || '') }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="staff-panel">
      <div className="staff-panel-heading">
        <Check size={18} />
        <div>
          <h3>{t('staff.inbox.title')}</h3>
          <p>{t('staff.inbox.body')}</p>
        </div>
      </div>
      <div className="inbox-grid">
        {inbox.length === 0 && <p className="empty-note">{t('staff.inbox.empty')}</p>}
        {inbox.map((item) => (
          <article key={item.id} className="inbox-card">
            <img src={item.imageDataUrl} alt="" />
            <div>
              <p className="tag-id-row"><span className="tag-id-label">{t('staff.tagId')}</span> <code className="tag-id">{item.trackingCode}</code></p>
              <p><strong>{t('track.from')}</strong> {displaySenderName(item.senderName, t('sender.anonymous'))}</p>
              {item.note ? <p>{item.note}</p> : null}
              {item.noteZh && <p lang="zh-Hant">{item.noteZh}</p>}
              <p className="inbox-status waiting">{t('staff.inbox.waiting')}</p>
              <button
                className="button primary small"
                onClick={() =>
                  run(() =>
                    updateSubmissionStatus(item.id, 'acknowledged', user.email, {
                      acknowledgedBy: user.email,
                      acknowledgedAt: new Date().toISOString(),
                    }),
                  )
                }
              >
                {t('staff.inbox.acknowledge')}
              </button>

              {(item.replies?.length ?? 0) > 0 && (
                <div className="caretaker-replies">
                  {item.replies.map((reply) => (
                    <div key={reply.id} className="caretaker-reply">
                      <small>{reply.authorName} · {new Date(reply.at).toLocaleString()}</small>
                      {reply.text && <p>{reply.text}</p>}
                      {reply.imageDataUrl && <img src={reply.imageDataUrl} alt="Caretaker reply" />}
                    </div>
                  ))}
                </div>
              )}

              <div className="caretaker-reply-form">
                <p className="eyebrow">{t('staff.inbox.replyTitle')}</p>
                <label>
                  {t('staff.inbox.replyText')}
                  <textarea
                    rows={3}
                    value={replyText[item.id] || ''}
                    onChange={(event) => setReplyText((current) => ({ ...current, [item.id]: event.target.value }))}
                    placeholder="A short thank-you or update for the sender..."
                  />
                </label>
                <label>
                  {t('staff.inbox.replyImage')}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => onPickImage(item.id, event.target.files?.[0] || null)}
                  />
                </label>
                {replyImage[item.id] && <img className="reply-preview" src={replyImage[item.id]} alt="" />}
                <button
                  type="button"
                  className="button ghost small"
                  disabled={!(replyText[item.id] || '').trim() && !replyImage[item.id]}
                  onClick={() =>
                    void onAct(async () => {
                      await addCaretakerReply(
                        item.id,
                        { email: user.email, displayName: user.displayName },
                        { text: replyText[item.id] || '', imageDataUrl: replyImage[item.id] || '' },
                      )
                      setReplyText((current) => ({ ...current, [item.id]: '' }))
                      setReplyImage((current) => ({ ...current, [item.id]: '' }))
                    })
                  }
                >
                  {t('staff.inbox.postReply')}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function SuperAdminPanel({
  facilities,
  audit,
  onAct,
  actorEmail,
}: {
  facilities: ReturnType<typeof listFacilities>
  audit: ReturnType<typeof listAudit>
  onAct: (action: () => void | Promise<void>) => void | Promise<void>
  actorEmail: string
}) {
  const { t } = useLanguage()
  return (
    <div className="staff-panel">
      <div className="staff-panel-heading">
        <ShieldCheck size={18} />
        <div>
          <h3>{t('staff.admin.title')}</h3>
          <p>{t('staff.admin.body')}</p>
        </div>
      </div>
      <div className="admin-grid">
        {facilities.map((facility) => (
          <label key={facility.id} className="admin-card">
            {facility.name}
            <select
              value={facility.deliveryFormat}
              onChange={(event) =>
                void onAct(() =>
                  setFacilityDeliveryFormat(facility.id, event.target.value as DeliveryFormat, actorEmail),
                )
              }
            >
              <option value="digital_inbox">{t('staff.admin.digital')}</option>
              <option value="print_packet">{t('staff.admin.print')}</option>
              <option value="slideshow">{t('staff.admin.slideshow')}</option>
            </select>
          </label>
        ))}
      </div>
      <div className="audit-list">
        {audit.slice(0, 12).map((entry) => (
          <p key={entry.id}>
            <time>{new Date(entry.at).toLocaleString()}</time> · {entry.actorEmail} · {entry.action}
            {entry.detail ? ` · ${entry.detail}` : ''}
          </p>
        ))}
      </div>
    </div>
  )
}

export default StaffWorkspace
