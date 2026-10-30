import { useEffect, useState } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { displaySenderName, fetchSubmissionByTracking } from '../platform/store'
import type { Submission, SubmissionStatus } from '../platform/types'
import { useLanguage } from '../i18n/LanguageContext'

const STAGES: SubmissionStatus[] = [
  'received',
  'in_review',
  'reviewed',
  'translated',
  'delivered',
  'acknowledged',
]

function stageIndex(status: SubmissionStatus) {
  if (status === 'needs_guardian') return 0
  if (status === 'rejected') return 1
  if (status === 'in_review') return 1
  return Math.max(0, STAGES.indexOf(status))
}

function StatusTracker({ initialCode = '' }: { initialCode?: string }) {
  const { t } = useLanguage()
  const [code, setCode] = useState(initialCode)
  const [query, setQuery] = useState(initialCode)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [looking, setLooking] = useState(false)
  const [searched, setSearched] = useState(Boolean(initialCode))

  useEffect(() => {
    if (!query) return
    let cancelled = false
    setLooking(true)
    void fetchSubmissionByTracking(query).then((result) => {
      if (cancelled) return
      setSubmission(result)
      setSearched(true)
      setLooking(false)
    })
    return () => {
      cancelled = true
    }
  }, [query])

  return (
    <section className="status-section" id="status">
      <div className="status-panel card-panel">
        <span className="eyebrow">{t('track.eyebrow')}</span>
        <h2>{t('track.title')}</h2>
        <p>{t('track.body')}</p>
        <form
          className="status-form"
          onSubmit={(event) => {
            event.preventDefault()
            setQuery(code.trim().toUpperCase())
          }}
        >
          <label>
            {t('track.code')}
            <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="AZ-XXXX-XXXX" />
          </label>
          <button className="button primary" type="submit" disabled={looking}>
            <Search size={16} /> {looking ? t('track.looking') : t('track.lookup')}
          </button>
        </form>

        {searched && query && !looking && !submission && (
          <p className="form-error">{t('track.notFound')}</p>
        )}

        {submission && (
          <div className="status-result">
            <img src={submission.imageDataUrl} alt="Your submitted drawing" />
            <div>
              <p className="eyebrow">{submission.trackingCode}</p>
              <h3>{t(`track.stage.${submission.status}`) || submission.status}</h3>
              <p><strong>{t('track.from')}</strong> {displaySenderName(submission.senderName, t('sender.anonymous'))}</p>
              <p>{submission.note || t('track.noNote')}</p>
              {submission.rejectReason && <p className="form-error">Moderator note: {submission.rejectReason}</p>}
              <ol className="status-pipeline">
                {STAGES.map((stage, index) => {
                  const current = stageIndex(submission.status)
                  const done = index <= current && submission.status !== 'rejected'
                  return (
                    <li key={stage} className={done ? 'done' : ''}>
                      <span>{t(`track.stage.${stage}`)}</span>
                    </li>
                  )
                })}
              </ol>

              {(submission.replies?.length ?? 0) > 0 && (
                <div className="status-replies">
                  <p className="eyebrow">{t('track.replies')}</p>
                  {submission.replies.map((reply) => (
                    <article key={reply.id} className="caretaker-reply">
                      <small>{reply.authorName} · {new Date(reply.at).toLocaleString()}</small>
                      {reply.text && <p>{reply.text}</p>}
                      {reply.imageDataUrl && <img src={reply.imageDataUrl} alt="" />}
                    </article>
                  ))}
                </div>
              )}

              <a className="button ghost" href="?page=draw">{t('track.createAnother')} <ArrowRight size={16} /></a>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default StatusTracker
