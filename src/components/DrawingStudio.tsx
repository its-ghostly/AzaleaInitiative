import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { ArrowRight, Check, Download, Eraser, Undo2, Redo2, X } from 'lucide-react'
import {
  createSubmission,
  displaySenderName,
  getCommunityDraft,
  getSessionUser,
  saveCommunityDraft,
} from '../platform/store'
import type { Submission } from '../platform/types'
import { useLanguage } from '../i18n/LanguageContext'

const CANVAS_BG = '#ffffff'
const COLORS = ['#29362e', '#e77560', '#e7a6c4', '#e7a833', '#6f8f78', '#7694b7', '#ffffff']
const BRUSH_MIN = 2
const BRUSH_MAX = 48
const DRAFT_KEY = 'azalea-drawing-draft-v1'

const PROMPTS: Record<'en' | 'zh', string[]> = {
  en: [
    'Draw a sunny day',
    'Fill the page with happy colors',
    'Draw a favorite flower',
    'Draw a happy day with your family',
    'Draw your favorite snack to share',
    'Draw a place that feels like home',
    'Draw two friends playing outside',
    'Draw a bright sky',
    'Draw your favorite hero cape',
    'Draw a garden',
    'Draw your favorite animal saying hi',
    'Draw a birthday cake with candles',
    'Draw music as shapes and color',
    'Draw a window with a hopeful view',
    'Draw hands holding kindness',
    'Draw a celebration without words',
    'Draw the ocean and a small boat',
    'Draw a star you would wish on',
    'Draw a tree with many different leaves',
    'Draw a cozy corner for resting',
    'Draw a bridge between two places',
    'Draw joy as a pattern',
    'Draw a feeling you wish you could describe',
    'Draw “together” without using words',
  ],
  zh: [
    '畫一個晴天',
    '用開心的顏色填滿畫面',
    '畫一朵喜歡的花',
    '畫和家人一起的快樂日子',
    '畫想分享的最愛點心',
    '畫一個像家的地方',
    '畫兩個在外面玩耍的朋友',
    '畫一片明亮的天空',
    '畫一件最愛的英雄披風',
    '畫一座花園',
    '畫最愛的動物在打招呼',
    '畫一個有蠟燭的生日蛋糕',
    '用形狀和顏色畫出音樂',
    '畫一扇充滿希望的窗',
    '畫一雙捧著善意的手',
    '不靠文字，畫一場慶祝',
    '畫大海和一艘小船',
    '畫一顆想許願的星星',
    '畫一棵葉子各不相同的樹',
    '畫一個可以休息的溫暖角落',
    '畫一座連接兩地的橋',
    '用圖案畫出快樂',
    '畫一種你想描述的感覺',
    '不用文字，畫出「在一起」',
  ],
}

type StampKind = 'flower' | 'sun' | 'heart'

function DrawingStudio({
  onClose,
  embedded = false,
  onSubmitted,
}: {
  onClose: () => void
  embedded?: boolean
  onSubmitted?: (submission: Submission) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPoint = useRef({ x: 0, y: 0 })
  const history = useRef<ImageData[]>([])
  const redoStack = useRef<ImageData[]>([])
  const [color, setColor] = useState(COLORS[0])
  const [brushSize, setBrushSize] = useState(8)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [senderName, setSenderName] = useState('')
  const [consentGallery, setConsentGallery] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [locale, setLocale] = useState<'en' | 'zh'>('en')
  const [promptIndex, setPromptIndex] = useState(0)
  const [step, setStep] = useState<'draw' | 'sent'>('draw')
  const [submitted, setSubmitted] = useState<Submission | null>(null)
  const [stamp, setStamp] = useState<StampKind | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const erasing = color === '#ffffff'

  const getContext = () => canvasRef.current?.getContext('2d') ?? null

  const syncHistoryFlags = () => {
    setCanUndo(history.current.length > 0)
    setCanRedo(redoStack.current.length > 0)
  }

  const fillCanvas = () => {
    const canvas = canvasRef.current
    const context = getContext()
    if (!canvas || !context) return
    context.fillStyle = CANVAS_BG
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const pushHistory = () => {
    const canvas = canvasRef.current
    const context = getContext()
    if (!canvas || !context) return
    history.current.push(context.getImageData(0, 0, canvas.width, canvas.height))
    if (history.current.length > 40) history.current.shift()
    redoStack.current = []
    syncHistoryFlags()
  }

  const undo = () => {
    const canvas = canvasRef.current
    const context = getContext()
    if (!canvas || !context || history.current.length === 0) return
    redoStack.current.push(context.getImageData(0, 0, canvas.width, canvas.height))
    const previous = history.current.pop()!
    context.putImageData(previous, 0, 0)
    syncHistoryFlags()
    persistDraft()
  }

  const redo = () => {
    const canvas = canvasRef.current
    const context = getContext()
    if (!canvas || !context || redoStack.current.length === 0) return
    history.current.push(context.getImageData(0, 0, canvas.width, canvas.height))
    const next = redoStack.current.pop()!
    context.putImageData(next, 0, 0)
    syncHistoryFlags()
    persistDraft()
  }

  const persistDraft = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const image = canvas.toDataURL('image/png')
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          image,
          senderName,
          locale,
        }),
      )
    } catch {
      /* ignore quota */
    }
    const user = getSessionUser()
    if (user?.kind === 'community') {
      void saveCommunityDraft({ image, senderName, locale, consentGallery }).catch(() => undefined)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const context = getContext()
    if (!canvas || !context) return
    fillCanvas()
    try {
      const serverDraft = getCommunityDraft()
      const raw = localStorage.getItem(DRAFT_KEY)
      const draft = serverDraft || (raw
        ? JSON.parse(raw) as {
            image?: string
            senderName?: string
            locale?: 'en' | 'zh'
            consentGallery?: boolean
          }
        : null)
      if (!draft) return
      if (draft.senderName) setSenderName(draft.senderName)
      if (draft.locale) setLocale(draft.locale)
      if ('consentGallery' in draft && typeof draft.consentGallery === 'boolean') {
        setConsentGallery(draft.consentGallery)
      }
      if (draft.image) {
        const image = new Image()
        image.onload = () => {
          context.drawImage(image, 0, 0, canvas.width, canvas.height)
        }
        image.src = draft.image
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return
      if ((event.metaKey || event.ctrlKey) && key === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
      }
      if ((event.metaKey || event.ctrlKey) && (key === 'y' || (key === 'z' && event.shiftKey))) {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const nextPrompt = () => {
    const total = PROMPTS.en.length
    if (total < 2) return
    let next = promptIndex
    while (next === promptIndex) {
      next = Math.floor(Math.random() * total)
    }
    setPromptIndex(next)
  }

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const paintDot = (context: CanvasRenderingContext2D, x: number, y: number) => {
    context.beginPath()
    context.fillStyle = color
    context.arc(x, y, brushSize / 2, 0, Math.PI * 2)
    context.fill()
  }

  const drawStamp = (context: CanvasRenderingContext2D, kind: StampKind, x: number, y: number) => {
    const size = Math.max(18, brushSize * 2.2)
    context.save()
    context.translate(x, y)
    if (kind === 'sun') {
      context.fillStyle = '#e7a833'
      context.beginPath()
      context.arc(0, 0, size * 0.28, 0, Math.PI * 2)
      context.fill()
      context.strokeStyle = '#e7a833'
      context.lineWidth = Math.max(2, size * 0.06)
      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 * i) / 8
        context.beginPath()
        context.moveTo(Math.cos(angle) * size * 0.36, Math.sin(angle) * size * 0.36)
        context.lineTo(Math.cos(angle) * size * 0.52, Math.sin(angle) * size * 0.52)
        context.stroke()
      }
    } else if (kind === 'heart') {
      context.fillStyle = '#e77560'
      context.beginPath()
      context.moveTo(0, size * 0.22)
      context.bezierCurveTo(size * 0.5, -size * 0.2, size * 0.55, size * 0.28, 0, size * 0.55)
      context.bezierCurveTo(-size * 0.55, size * 0.28, -size * 0.5, -size * 0.2, 0, size * 0.22)
      context.fill()
    } else {
      context.fillStyle = '#e7a6c4'
      for (let i = 0; i < 5; i += 1) {
        const angle = (Math.PI * 2 * i) / 5
        context.beginPath()
        context.ellipse(Math.cos(angle) * size * 0.18, Math.sin(angle) * size * 0.18, size * 0.2, size * 0.12, angle, 0, Math.PI * 2)
        context.fill()
      }
      context.fillStyle = '#e7a833'
      context.beginPath()
      context.arc(0, 0, size * 0.1, 0, Math.PI * 2)
      context.fill()
    }
    context.restore()
  }

  const startDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    const context = getContext()
    if (!context) return
    pushHistory()
    const next = point(event)
    if (stamp) {
      drawStamp(context, stamp, next.x, next.y)
      persistDraft()
      return
    }
    drawing.current = true
    lastPoint.current = next
    paintDot(context, lastPoint.current.x, lastPoint.current.y)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || stamp) return
    const context = getContext()
    if (!context) return
    const next = point(event)
    const pressure = event.pressure > 0 ? event.pressure : 0.5
    context.beginPath()
    context.moveTo(lastPoint.current.x, lastPoint.current.y)
    context.lineTo(next.x, next.y)
    context.strokeStyle = color
    context.lineWidth = brushSize * (0.65 + pressure * 0.7)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.stroke()
    lastPoint.current = next
  }

  const endDrawing = () => {
    drawing.current = false
    persistDraft()
  }

  const clear = () => {
    pushHistory()
    fillCanvas()
    persistDraft()
  }

  const download = () => {
    const link = document.createElement('a')
    link.download = 'azalea-artwork.png'
    link.href = canvasRef.current!.toDataURL('image/png')
    link.click()
  }

  const openSendPopup = () => {
    persistDraft()
    setSendOpen(true)
  }

  const submit = async () => {
    const canvas = canvasRef.current
    if (!canvas || submitting) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const result = await createSubmission({
        imageDataUrl: canvas.toDataURL('image/png'),
        senderName: senderName.trim(),
        note: '',
        locale,
        ageBand: 'prefer_not',
        guardianEmail: '',
        consentDelivery: true,
        consentGallery,
      })
      localStorage.removeItem(DRAFT_KEY)
      setSendOpen(false)
      setSubmitted(result)
      setStep('sent')
      onSubmitted?.(result)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save your drawing. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const { t } = useLanguage()
  const shellClass = embedded ? 'studio studio-embedded' : 'studio'
  const prompt = PROMPTS[locale][promptIndex]

  return (
    <div className={embedded ? 'draw-studio-shell' : 'modal-backdrop'} role={embedded ? undefined : 'dialog'} aria-modal={embedded ? undefined : true} aria-labelledby="studio-title">
      <div className={shellClass}>
        <div className="studio-header">
          <div>
            <span className="eyebrow">A small act of joy</span>
            <h2 id="studio-title">{step === 'sent' ? 'On its way' : 'Create something kind'}</h2>
            {step === 'draw' && (
              <p className="studio-prompt">
                <button type="button" className="locale-toggle" onClick={() => setLocale((value) => (value === 'en' ? 'zh' : 'en'))}>
                  {locale === 'en' ? 'EN' : '繁'}
                </button>
                <em>{prompt}</em>
                <button type="button" className="prompt-cycle" onClick={nextPrompt} aria-label="Show another drawing prompt">
                  Another idea
                </button>
              </p>
            )}
          </div>
          <button className="icon-button" onClick={onClose} aria-label={embedded ? 'Back to home' : 'Close drawing studio'}><X /></button>
        </div>

        {step === 'sent' && submitted ? (
          <div className="success-state">
            <span className="success-icon"><Check /></span>
            <h3 className="handwritten-success">Your kindness is on its way.</h3>
            <p>
              Thanks, {displaySenderName(senderName, t('sender.anonymous'))}.{' '}
              Tracking code <strong>{submitted.trackingCode}</strong> — status: <strong>{submitted.status.replaceAll('_', ' ')}</strong>.
              An Azalea volunteer will review it before partner caretakers receive it.
            </p>
            <a className="button primary" href={`?page=status&code=${submitted.trackingCode}`}>Track this drawing</a>
            <button className="button ghost" onClick={onClose}>Back to the garden</button>
          </div>
        ) : (
          <>
            <div className="canvas-frame paper-frame">
              <canvas
                ref={canvasRef}
                width={900}
                height={520}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={endDrawing}
                onPointerCancel={endDrawing}
                aria-label="Drawing canvas"
              />
            </div>

            <div className="pencil-case" aria-label="Drawing tools">
              <div className="colors" aria-label="Drawing colors">
                {COLORS.slice(0, -1).map((item) => (
                  <button
                    key={item}
                    className={`color-swatch ${color === item && !stamp ? 'active' : ''}`}
                    style={{ backgroundColor: item }}
                    onClick={() => { setColor(item); setStamp(null) }}
                    aria-label={`Select color ${item}`}
                  />
                ))}
                <button className={`eraser ${erasing && !stamp ? 'active' : ''}`} onClick={() => { setColor('#ffffff'); setStamp(null) }} aria-label="Eraser">
                  <Eraser size={18} />
                </button>
                <button className="icon-tool" onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl/Cmd+Z)"><Undo2 size={18} /></button>
                <button className="icon-tool" onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl/Cmd+Shift+Z)"><Redo2 size={18} /></button>
                <button className="text-button" onClick={clear}>Clear</button>
              </div>

              <div className="stamp-row" aria-label="Stamps">
                {(['flower', 'sun', 'heart'] as StampKind[]).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    className={`stamp-button ${stamp === kind ? 'active' : ''}`}
                    onClick={() => setStamp((current) => (current === kind ? null : kind))}
                  >
                    {kind}
                  </button>
                ))}
              </div>

              <div className="brush-controls" aria-label="Brush size">
                <span className="brush-label">{stamp ? 'Stamp' : erasing ? 'Eraser' : 'Brush'} {brushSize}px</span>
                <input
                  type="range"
                  min={BRUSH_MIN}
                  max={BRUSH_MAX}
                  value={brushSize}
                  onChange={(event) => setBrushSize(Number(event.target.value))}
                  aria-label="Brush size"
                />
                <span className="brush-preview" aria-hidden="true">
                  <span style={{ width: brushSize, height: brushSize, background: erasing ? '#d7d2c8' : color }} />
                </span>
              </div>
            </div>

            <div className="studio-message studio-message-compact">
              <label>
                Your name <span>(optional)</span>
                <input value={senderName} onChange={(event) => setSenderName(event.target.value)} maxLength={40} placeholder="First name or nickname" autoComplete="nickname" />
              </label>
            </div>

            <div className="studio-toolbar send-row">
              <button className="button ghost small" onClick={download}><Download size={17} /> Save for myself</button>
              <button className="button primary small" onClick={openSendPopup}>Send with love <ArrowRight size={17} /></button>
            </div>
            <p className="privacy-note">Drawings are saved on the Azalea server for delivery and the shared garden. Use Save progress in the header to keep drafts across visits. Undo/redo: Ctrl/Cmd+Z / Shift+Z.</p>

            {sendOpen && (
              <div className="send-popup-backdrop" role="dialog" aria-modal="true" aria-labelledby="send-checklist-title">
                <div className="send-popup">
                  <div className="send-popup-header">
                    <div>
                      <p className="eyebrow">Before you send</p>
                      <h3 id="send-checklist-title">Please confirm</h3>
                    </div>
                    <button type="button" className="icon-button" onClick={() => setSendOpen(false)} aria-label="Close"><X /></button>
                  </div>
                  <ul className="send-guidelines">
                    <li>Keep the message kind and respectful.</li>
                    <li>Do not include personal contact details, addresses, or school names.</li>
                    <li>Submissions are reviewed before they reach partner caretakers.</li>
                  </ul>
                  <label className="send-optional">
                    <input type="checkbox" checked={consentGallery} onChange={(event) => setConsentGallery(event.target.checked)} />
                    Optional: feature this drawing in the shared garden gallery.
                  </label>
                  {submitError && <p className="form-error">{submitError}</p>}
                  <div className="send-popup-actions">
                    <button type="button" className="button ghost" onClick={() => setSendOpen(false)}>Keep drawing</button>
                    <button type="button" className="button primary" onClick={() => void submit()} disabled={submitting}>
                      {submitting ? 'Saving…' : <>Confirm & send <ArrowRight size={17} /></>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default DrawingStudio
