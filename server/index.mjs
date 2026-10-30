import cors from 'cors'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DATA_DIR = process.env.AZALEA_DATA_DIR
  ? path.resolve(process.env.AZALEA_DATA_DIR)
  : path.join(ROOT, 'data')
const MEDIA_DIR = path.join(DATA_DIR, 'media')
const DB_PATH = path.join(DATA_DIR, 'db.json')

const STAFF_EMAIL = process.env.AZALEA_STAFF_EMAIL || 'celine.zhang@aloft9.com'
const STAFF_PASSWORD = process.env.AZALEA_STAFF_PASSWORD || ''
const PORT = Number(process.env.PORT || 8787)
const NOTIFY_EMAIL = process.env.AZALEA_NOTIFY_EMAIL || STAFF_EMAIL

if (!STAFF_PASSWORD) {
  console.warn('Warning: AZALEA_STAFF_PASSWORD is not set. Staff login will be disabled until you set it.')
}

const FACILITIES = [
  {
    id: 'hysiang-yuan',
    name: 'Hysiang Yuan Disabled Care Facility',
    deliveryFormat: 'digital_inbox',
  },
]

function ensureDirs() {
  fs.mkdirSync(MEDIA_DIR, { recursive: true })
}

function uid(prefix) {
  return `${prefix}-${crypto.randomBytes(4).toString('hex')}${Date.now().toString(36).slice(-4)}`
}

function trackingCode() {
  const chunk = () => crypto.randomBytes(2).toString('hex').toUpperCase()
  return `AZ-${chunk()}-${chunk()}`
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return { salt, hash }
}

function verifyPassword(password, salt, hash) {
  try {
    const next = crypto.scryptSync(password, salt, 64).toString('hex')
    const left = Buffer.from(hash, 'hex')
    const right = Buffer.from(next, 'hex')
    if (left.length !== right.length) return false
    return crypto.timingSafeEqual(left, right)
  } catch {
    return false
  }
}

function blankDb() {
  const staff = hashPassword(STAFF_PASSWORD)
  return {
    staff: {
      id: 'u-staff',
      email: STAFF_EMAIL,
      displayName: 'Celine Zhang',
      role: 'super_admin',
      facilityId: 'hysiang-yuan',
      active: true,
      salt: staff.salt,
      passwordHash: staff.hash,
    },
    communityUsers: [],
    submissions: [],
    volunteerApplications: [],
    audit: [],
    sessions: {},
    drafts: {},
  }
}

function loadDb() {
  ensureDirs()
  if (!fs.existsSync(DB_PATH)) {
    const db = blankDb()
    saveDb(db)
    return db
  }
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
  const needsStaffReset =
    Boolean(STAFF_PASSWORD) && (
      !db.staff ||
      db.staff.email !== STAFF_EMAIL ||
      !db.staff.salt ||
      !db.staff.passwordHash ||
      !verifyPassword(STAFF_PASSWORD, db.staff.salt, db.staff.passwordHash)
    )

  if (needsStaffReset) {
    const staffCreds = hashPassword(STAFF_PASSWORD)
    db.staff = {
      id: 'u-staff',
      email: STAFF_EMAIL,
      displayName: 'Celine Zhang',
      role: 'super_admin',
      facilityId: 'hysiang-yuan',
      active: true,
      salt: staffCreds.salt,
      passwordHash: staffCreds.hash,
    }
    saveDb(db)
  }
  db.communityUsers = db.communityUsers || []
  db.submissions = db.submissions || []
  db.volunteerApplications = db.volunteerApplications || []
  db.audit = db.audit || []
  db.sessions = db.sessions || {}
  db.drafts = db.drafts || {}
  return db
}

function saveDb(db) {
  ensureDirs()
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

function pushAudit(db, actor, action, submissionId, detail) {
  db.audit = [
    {
      id: uid('audit'),
      at: new Date().toISOString(),
      actorEmail: actor,
      action,
      submissionId,
      detail,
    },
    ...(db.audit || []),
  ].slice(0, 300)
}

function saveDataUrl(dataUrl, id) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || '')
  if (!match) return null
  const ext = match[1].includes('jpeg') || match[1].includes('jpg') ? 'jpg' : 'png'
  const filename = `${id}.${ext}`
  fs.writeFileSync(path.join(MEDIA_DIR, filename), Buffer.from(match[2], 'base64'))
  return `/api/media/${filename}`
}

function publicUser(user) {
  if (!user) return null
  return {
    id: user.id,
    email: user.email || '',
    username: user.username || '',
    displayName: user.displayName,
    role: user.role,
    facilityId: user.facilityId,
    active: user.active !== false,
    kind: user.username ? 'community' : 'staff',
  }
}

function getSessionUser(db, req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.headers['x-azalea-token']
  if (!token) return null
  const session = db.sessions[token]
  if (!session) return null
  if (session.kind === 'staff' && session.email === db.staff.email && db.staff.active) {
    return { ...publicUser(db.staff), token }
  }
  if (session.kind === 'community') {
    const user = db.communityUsers.find((item) => item.username === session.username && item.active !== false)
    return user ? { ...publicUser(user), token } : null
  }
  return null
}

function requireStaff(db, req, res) {
  const user = getSessionUser(db, req)
  if (!user || user.kind !== 'staff') {
    res.status(401).json({ error: 'Staff sign-in required.' })
    return null
  }
  return user
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '12mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/bootstrap', (req, res) => {
  const db = loadDb()
  const user = getSessionUser(db, req)
  const submissions = db.submissions.map((item) => ({
    ...item,
    replies: item.replies || [],
  }))
  res.json({
    user,
    facilities: FACILITIES,
    submissions,
    volunteerApplications: user?.kind === 'staff' ? db.volunteerApplications : [],
    audit: user?.kind === 'staff' ? db.audit : [],
    draft: user?.kind === 'community' ? db.drafts[user.username] || null : null,
    notifyEmail: NOTIFY_EMAIL,
  })
})

app.post('/api/volunteer-applications', (req, res) => {
  const db = loadDb()
  const application = {
    id: uid('app'),
    createdAt: new Date().toISOString(),
    firstName: String(req.body.firstName || '').trim(),
    email: String(req.body.email || '').trim().toLowerCase(),
    stage: String(req.body.stage || '').trim(),
    interest: String(req.body.interest || '').trim(),
    motivation: String(req.body.motivation || '').trim(),
    notifyEmail: NOTIFY_EMAIL,
  }
  if (!application.firstName || !application.email || !application.stage || !application.interest || !application.motivation) {
    return res.status(400).json({ error: 'Please complete every field in the application.' })
  }
  db.volunteerApplications = [application, ...(db.volunteerApplications || [])]
  pushAudit(db, application.email, 'volunteer:apply', undefined, application.firstName)
  saveDb(db)
  const subject = encodeURIComponent(`Azalea volunteer application — ${application.firstName}`)
  const body = encodeURIComponent(
    [
      'New Azalea volunteer application',
      '',
      `Name: ${application.firstName}`,
      `Email: ${application.email}`,
      `Stage: ${application.stage}`,
      `Interest: ${application.interest}`,
      '',
      'Why interested:',
      application.motivation,
      '',
      `Submitted: ${application.createdAt}`,
    ].join('\n'),
  )
  res.status(201).json({
    application,
    mailto: `mailto:${NOTIFY_EMAIL}?subject=${subject}&body=${body}`,
    notifyEmail: NOTIFY_EMAIL,
  })
})

app.get('/api/volunteer-applications', (req, res) => {
  const db = loadDb()
  const staff = requireStaff(db, req, res)
  if (!staff) return
  res.json({ applications: db.volunteerApplications || [] })
})

app.get('/api/media/:file', (req, res) => {
  const file = path.basename(req.params.file)
  const full = path.join(MEDIA_DIR, file)
  if (!fs.existsSync(full)) return res.status(404).end()
  res.sendFile(full)
})

app.post('/api/auth/staff/login', (req, res) => {
  const db = loadDb()
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  if (!STAFF_PASSWORD) {
    return res.status(503).json({ error: 'Staff login is not configured. Set AZALEA_STAFF_PASSWORD on the server.' })
  }
  if (email !== STAFF_EMAIL) {
    return res.status(403).json({ error: 'Staff access is limited to the authorized Azalea account.' })
  }
  if (!verifyPassword(password, db.staff.salt, db.staff.passwordHash)) {
    return res.status(401).json({ error: 'Incorrect password.' })
  }
  const token = uid('sess')
  db.sessions[token] = { kind: 'staff', email: STAFF_EMAIL, at: new Date().toISOString() }
  pushAudit(db, STAFF_EMAIL, 'login')
  saveDb(db)
  res.json({ token, user: publicUser(db.staff) })
})

app.post('/api/auth/community/register', (req, res) => {
  const db = loadDb()
  const username = String(req.body.username || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const displayName = String(req.body.displayName || username).trim() || username
  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    return res.status(400).json({ error: 'Username must be 3–24 characters: letters, numbers, underscore.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' })
  }
  if (db.communityUsers.some((item) => item.username === username)) {
    return res.status(409).json({ error: 'That username is already taken.' })
  }
  const { salt, hash } = hashPassword(password)
  const user = {
    id: uid('user'),
    username,
    displayName,
    role: 'sender',
    active: true,
    salt,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  }
  db.communityUsers.push(user)
  const token = uid('sess')
  db.sessions[token] = { kind: 'community', username, at: new Date().toISOString() }
  pushAudit(db, username, 'community:register')
  saveDb(db)
  res.json({ token, user: publicUser(user) })
})

app.post('/api/auth/community/login', (req, res) => {
  const db = loadDb()
  const username = String(req.body.username || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const user = db.communityUsers.find((item) => item.username === username && item.active !== false)
  if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
    return res.status(401).json({ error: 'Username or password is incorrect.' })
  }
  const token = uid('sess')
  db.sessions[token] = { kind: 'community', username, at: new Date().toISOString() }
  pushAudit(db, username, 'community:login')
  saveDb(db)
  res.json({ token, user: publicUser(user), draft: db.drafts[username] || null })
})

app.post('/api/auth/logout', (req, res) => {
  const db = loadDb()
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (token && db.sessions[token]) {
    const session = db.sessions[token]
    pushAudit(db, session.email || session.username || 'unknown', 'logout')
    delete db.sessions[token]
    saveDb(db)
  }
  res.json({ ok: true })
})

app.put('/api/me/draft', (req, res) => {
  const db = loadDb()
  const user = getSessionUser(db, req)
  if (!user || user.kind !== 'community') {
    return res.status(401).json({ error: 'Sign in with a community account to save progress.' })
  }
  db.drafts[user.username] = {
    image: req.body.image || '',
    senderName: req.body.senderName || '',
    locale: req.body.locale || 'en',
    consentGallery: Boolean(req.body.consentGallery),
    updatedAt: new Date().toISOString(),
  }
  saveDb(db)
  res.json({ ok: true, draft: db.drafts[user.username] })
})

app.get('/api/me/draft', (req, res) => {
  const db = loadDb()
  const user = getSessionUser(db, req)
  if (!user || user.kind !== 'community') {
    return res.status(401).json({ error: 'Sign in required.' })
  }
  res.json({ draft: db.drafts[user.username] || null })
})

app.post('/api/submissions', (req, res) => {
  const db = loadDb()
  const user = getSessionUser(db, req)
  const imagePath = saveDataUrl(req.body.imageDataUrl, uid('img'))
  if (!imagePath) {
    return res.status(400).json({ error: 'A valid drawing image is required.' })
  }
  const now = new Date().toISOString()
  const ageBand = req.body.ageBand || 'prefer_not'
  const guardianEmail = String(req.body.guardianEmail || '')
  const needsGuardian = ageBand === 'under_13' || ageBand === '13_17'
  const submission = {
    id: uid('sub'),
    trackingCode: trackingCode(),
    createdAt: now,
    updatedAt: now,
    imageDataUrl: imagePath,
    senderName: String(req.body.senderName || '').trim(),
    note: String(req.body.note || ''),
    noteZh: '',
    locale: req.body.locale === 'zh' ? 'zh' : 'en',
    ageBand,
    guardianEmail,
    consentDelivery: true,
    consentGallery: Boolean(req.body.consentGallery),
    status: needsGuardian && !guardianEmail.trim() ? 'needs_guardian' : 'received',
    rejectReason: '',
    facilityId: 'hysiang-yuan',
    reviewedBy: '',
    translatedBy: '',
    deliveredBy: '',
    acknowledgedBy: '',
    acknowledgedAt: '',
    replies: [],
    ownerUsername: user?.kind === 'community' ? user.username : '',
  }
  db.submissions.unshift(submission)
  if (user?.kind === 'community') delete db.drafts[user.username]
  pushAudit(db, user?.username || submission.senderName || 'anonymous-sender', 'submit', submission.id, submission.trackingCode)
  saveDb(db)
  res.status(201).json({ submission })
})

app.get('/api/submissions', (req, res) => {
  const db = loadDb()
  const user = getSessionUser(db, req)
  let list = db.submissions.map((item) => ({ ...item, replies: item.replies || [] }))
  if (user?.kind !== 'staff') {
    list = list.filter((item) => item.status !== 'rejected')
  }
  res.json({ submissions: list })
})

app.get('/api/submissions/track/:code', (req, res) => {
  const db = loadDb()
  const code = String(req.params.code || '').trim().toUpperCase()
  const found = db.submissions.find((item) => item.trackingCode === code)
  if (!found) return res.status(404).json({ error: 'Not found' })
  res.json({ submission: { ...found, replies: found.replies || [] } })
})

app.patch('/api/submissions/:id/status', (req, res) => {
  const db = loadDb()
  const staff = requireStaff(db, req, res)
  if (!staff) return
  const index = db.submissions.findIndex((item) => item.id === req.params.id)
  if (index < 0) return res.status(404).json({ error: 'Not found' })
  const current = db.submissions[index]
  const extras = req.body.extras || {}
  const updated = {
    ...current,
    ...extras,
    status: req.body.status,
    updatedAt: new Date().toISOString(),
  }
  db.submissions[index] = updated
  pushAudit(db, staff.email, `status:${req.body.status}`, updated.id, extras.rejectReason || extras.noteZh)
  saveDb(db)
  res.json({ submission: updated })
})

app.post('/api/submissions/:id/replies', (req, res) => {
  const db = loadDb()
  const staff = requireStaff(db, req, res)
  if (!staff) return
  const index = db.submissions.findIndex((item) => item.id === req.params.id)
  if (index < 0) return res.status(404).json({ error: 'Not found' })
  const current = db.submissions[index]
  let imageDataUrl = ''
  if (req.body.imageDataUrl) {
    imageDataUrl = saveDataUrl(req.body.imageDataUrl, uid('reply')) || ''
  }
  const reply = {
    id: uid('reply'),
    at: new Date().toISOString(),
    authorEmail: staff.email,
    authorName: staff.displayName,
    text: String(req.body.text || '').trim(),
    imageDataUrl,
  }
  const updated = {
    ...current,
    replies: [...(current.replies || []), reply],
    updatedAt: new Date().toISOString(),
  }
  db.submissions[index] = updated
  pushAudit(db, staff.email, 'reply', updated.id, reply.text.slice(0, 80))
  saveDb(db)
  res.json({ submission: updated })
})

app.patch('/api/facilities/:id', (req, res) => {
  const db = loadDb()
  const staff = requireStaff(db, req, res)
  if (!staff) return
  const facility = FACILITIES.find((item) => item.id === req.params.id)
  if (!facility) return res.status(404).json({ error: 'Not found' })
  facility.deliveryFormat = req.body.deliveryFormat || facility.deliveryFormat
  pushAudit(db, staff.email, 'facility:delivery_format', undefined, `${facility.id}:${facility.deliveryFormat}`)
  saveDb(db)
  res.json({ facility })
})

const DIST_DIR = path.join(ROOT, 'dist')
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
}

const HOST = process.env.HOST || '0.0.0.0'
app.listen(PORT, HOST, () => {
  ensureDirs()
  loadDb()
  console.log(`Azalea listening on http://${HOST}:${PORT}`)
  console.log(`Staff login: ${STAFF_EMAIL}`)
})
