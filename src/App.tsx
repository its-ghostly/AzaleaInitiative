import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flower2,
  HandHeart,
  Heart,
  Home,
  Mail,
  Megaphone,
  Menu,
  ShieldCheck,
  Shirt,
  Sparkles,
  Users,
} from 'lucide-react'
import './App.css'
import CommunityAccount from './components/CommunityAccount'
import StaffWorkspace from './components/StaffWorkspace'
import StatusTracker from './components/StatusTracker'
import { LanguageSwitch, useLanguage } from './i18n/LanguageContext'
import { asset } from './lib/asset'
import { usePlatform } from './platform/usePlatform'

/** Long-term team recruitment — Google Form. */
const LONG_TERM_RECRUITMENT_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScUn7QCgsH57MzUQ4oP_T6OEyWCow7cKDR-w827PWBw-sTasQ/viewform'

/** Temporary / short-window volunteering — Google Form. */
const TEMPORARY_RECRUITMENT_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdExRZcfmxhQAnSO51VaqlRvvwRJsyA1NdUj6ZV_5fTyAA3lQ/viewform'

/** Winter Service Intensive interest — Google Form. */
const WINTER_INTEREST_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSd4Yyz2sA9awdU6cQbN3-XH6qc4DfwRweGIURQheaNQJbIsAw/viewform'

/** Summer 2025 closing play / service trip video. */
const WINTER_CLOSING_PLAY_VIDEO_URL = 'https://www.youtube.com/watch?v=swkW36jNlY0'

function ComingSoonPanel() {
  const { t } = useLanguage()
  return (
    <div className="coming-soon-panel">
      <span className="coming-soon-badge">{t('comingSoon.badge')}</span>
      <h2>{t('comingSoon.title')}</h2>
      <p>{t('comingSoon.body')}</p>
      <a className="button ghost" href={WINTER_PROGRAM_HREF}>{t('hero.ctaProgram')}</a>
    </div>
  )
}

type VolunteerPageId = 'why' | 'camp' | 'mooncake' | 'play' | 'press' | 'cafe' | 'mayor' | 'debrief' | 'expand'
type VolunteerPageMeta = {
  id: VolunteerPageId
  art: string
  articleUrl?: string
  articleSource?: string
  videoUrl?: string
  image?: string
  images?: string[]
  detailCount: number
}

/** Timeless pages — always attached to the most recent year journal. */
const VOLUNTEER_INTRO: VolunteerPageMeta = { id: 'why', art: 'florals', detailCount: 3 }

/** Story pages by year. Journals are listed newest → oldest. */
const VOLUNTEER_JOURNALS: { year: number; pages: VolunteerPageMeta[] }[] = [
  {
    year: 2026,
    pages: [
      {
        id: 'camp',
        art: 'garden',
        image: 'press/together-we-shine.jpg',
        detailCount: 4,
      },
    ],
  },
  {
    year: 2025,
    pages: [
      {
        id: 'mooncake',
        art: 'mooncake',
        images: [
          'press/mooncake-2025/stirring.jpg',
          'press/mooncake-2025/workshop.jpg',
          'press/mooncake-2025/table.jpg',
          'press/mooncake-2025/molds.jpg',
        ],
        detailCount: 3,
      },
      {
        id: 'play',
        art: 'garden',
        videoUrl: WINTER_CLOSING_PLAY_VIDEO_URL,
        detailCount: 3,
      },
      {
        id: 'press',
        art: 'press',
        articleUrl: 'https://hoomedia.com.tw/2025/07/02/76051/',
        articleSource: '互傳媒 Hoo Media',
        image: 'press/hoomedia-camping.jpg',
        detailCount: 3,
      },
      {
        id: 'expand',
        art: 'expand',
        image: 'press/sj-expand-meeting.jpg',
        detailCount: 3,
      },
    ],
  },
  {
    year: 2024,
    pages: [
      {
        id: 'cafe',
        art: 'cafe',
        image: 'press/cafe-transition.jpg',
        detailCount: 3,
      },
      {
        id: 'mayor',
        art: 'mayor',
        image: 'press/mayor-awards.jpg',
        detailCount: 3,
      },
      {
        id: 'debrief',
        art: 'debrief',
        image: 'press/first-debrief.jpg',
        detailCount: 3,
      },
    ],
  },
]

const LATEST_VOLUNTEER_YEAR = VOLUNTEER_JOURNALS[0].year

function pagesForVolunteerYear(year: number): VolunteerPageMeta[] {
  const journal = VOLUNTEER_JOURNALS.find((entry) => entry.year === year)
  const yearPages = journal?.pages ?? []
  return year === LATEST_VOLUNTEER_YEAR ? [VOLUNTEER_INTRO, ...yearPages] : yearPages
}

function volunteerPhotoCredit(id: VolunteerPageId): `volunteer.${VolunteerPageId}.credit` | 'volunteer.ourVolunteers' {
  if (id === 'press' || id === 'play' || id === 'mooncake' || id === 'cafe' || id === 'mayor' || id === 'debrief' || id === 'expand') {
    return `volunteer.${id}.credit`
  }
  return 'volunteer.ourVolunteers'
}

type SitePage = 'home' | 'draw' | 'thank' | 'view' | 'updates' | 'volunteer' | 'about' | 'events' | 'local' | 'contact' | 'staff' | 'status'

function resolvePage(): SitePage {
  const requested = new URLSearchParams(window.location.search).get('page')
  if (
    requested === 'draw'
    || requested === 'thank'
    || requested === 'view'
    || requested === 'updates'
    || requested === 'volunteer'
    || requested === 'about'
    || requested === 'events'
    || requested === 'local'
    || requested === 'contact'
    || requested === 'staff'
    || requested === 'status'
  ) {
    return requested
  }
  return 'home'
}

type CalendarEvent = {
  id: string
  start: string
  end: string
  titleKey: string
  bodyKey: string
  datesKey: string
  ctaKey: string
  href: string
  secondaryCtaKey?: string
  secondaryHref?: string
  secondaryExternal?: boolean
}

const WINTER_PROGRAM_HASH = 'winter-program'
const WINTER_PROGRAM_HREF = `./#${WINTER_PROGRAM_HASH}`

/** Upcoming Azalea events (ISO dates, inclusive). */
const AZALEA_EVENTS: CalendarEvent[] = [
  {
    id: 'camp-2026',
    start: '2026-07-21',
    end: '2026-07-23',
    titleKey: 'events.camp.title',
    bodyKey: 'events.camp.body',
    datesKey: 'events.camp.dates',
    ctaKey: 'events.camp.cta',
    href: '?page=volunteer',
  },
  {
    id: 'winter-2026',
    start: '2026-12-23',
    end: '2027-01-03',
    titleKey: 'events.winter.title',
    bodyKey: 'events.winter.body',
    datesKey: 'events.winter.dates',
    ctaKey: 'events.winter.cta',
    href: WINTER_PROGRAM_HREF,
    secondaryCtaKey: 'winter.ctaApply',
    secondaryHref: WINTER_INTEREST_FORM_URL,
    secondaryExternal: true,
  },
]

function dateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isDateInEvent(isoDay: string, event: CalendarEvent) {
  return isoDay >= event.start && isoDay <= event.end
}

function todayISO() {
  const now = new Date()
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Upcoming soonest-first, then past most-recent-first. */
function sortEventsForDisplay(events: CalendarEvent[]) {
  const today = todayISO()
  const upcoming = events
    .filter((event) => event.end >= today)
    .sort((a, b) => a.start.localeCompare(b.start))
  const past = events
    .filter((event) => event.end < today)
    .sort((a, b) => b.start.localeCompare(a.start))
  return [...upcoming, ...past]
}

/** Browse month-by-month across the program year (includes Jan 2027 for the winter window). */
const CALENDAR_MIN = { year: 2026, monthIndex: 0 }
const CALENDAR_MAX = { year: 2027, monthIndex: 0 }

function monthCursorKey(year: number, monthIndex: number) {
  return year * 12 + monthIndex
}

function clampCalendarMonth(year: number, monthIndex: number) {
  const value = monthCursorKey(year, monthIndex)
  const min = monthCursorKey(CALENDAR_MIN.year, CALENDAR_MIN.monthIndex)
  const max = monthCursorKey(CALENDAR_MAX.year, CALENDAR_MAX.monthIndex)
  if (value < min) return { ...CALENDAR_MIN }
  if (value > max) return { ...CALENDAR_MAX }
  return { year, monthIndex }
}

function calendarStartFromToday() {
  const today = new Date()
  return clampCalendarMonth(today.getFullYear(), today.getMonth())
}

function todayDateKey() {
  const today = new Date()
  return dateKey(today.getFullYear(), today.getMonth(), today.getDate())
}

function MonthCalendar({
  year,
  monthIndex,
  events,
  weekdayLabels,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  year: number
  monthIndex: number
  events: CalendarEvent[]
  weekdayLabels: string[]
  onPrev: () => void
  onNext: () => void
  canPrev: boolean
  canNext: boolean
}) {
  const { t, lang } = useLanguage()
  const todayIso = todayDateKey()
  const first = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const startWeekday = first.getDay()
  const monthLabel = first.toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'zh-Hant' ? 'zh-Hant' : 'zh-Hans', {
    month: 'long',
    year: 'numeric',
  })
  const cells: Array<{ day: number | null; iso: string | null; event: CalendarEvent | null }> = []
  for (let i = 0; i < startWeekday; i += 1) cells.push({ day: null, iso: null, event: null })
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = dateKey(year, monthIndex, day)
    const event = events.find((item) => isDateInEvent(iso, item)) ?? null
    cells.push({ day, iso, event })
  }

  return (
    <div className="month-calendar">
      <div className="calendar-nav">
        <button type="button" className="calendar-nav-btn" onClick={onPrev} disabled={!canPrev} aria-label={t('events.prevMonth')}>
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <h3>{monthLabel}</h3>
        <button type="button" className="calendar-nav-btn" onClick={onNext} disabled={!canNext} aria-label={t('events.nextMonth')}>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="calendar-weekdays" aria-hidden="true">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="calendar-grid" role="grid" aria-label={monthLabel}>
        {cells.map((cell, index) => (
          <div
            key={`${monthLabel}-${index}`}
            role="gridcell"
            className={[
              'calendar-day',
              cell.day ? '' : 'is-empty',
              cell.event ? 'is-event' : '',
              cell.iso === cell.event?.start ? 'is-start' : '',
              cell.iso === cell.event?.end ? 'is-end' : '',
              cell.iso === todayIso ? 'is-today' : '',
            ].filter(Boolean).join(' ')}
            title={cell.event ? t(cell.event.titleKey) : undefined}
            aria-current={cell.iso === todayIso ? 'date' : undefined}
          >
            {cell.day ?? ''}
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  const { t } = useLanguage()
  const { user } = usePlatform()
  const isStaff = user?.kind === 'staff'
  const [menuOpen, setMenuOpen] = useState(false)
  const [volunteerYear, setVolunteerYear] = useState(() => {
    const year = Number(new URLSearchParams(window.location.search).get('year'))
    return VOLUNTEER_JOURNALS.some((journal) => journal.year === year) ? year : LATEST_VOLUNTEER_YEAR
  })
  const [volunteerPage, setVolunteerPage] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const year = Number(params.get('year'))
    const story = params.get('story')
    if (!story || !VOLUNTEER_JOURNALS.some((journal) => journal.year === year)) return 0
    const pages = pagesForVolunteerYear(year)
    const index = pages.findIndex((entry) => entry.id === story)
    return index >= 0 ? index : 0
  })
  const [flipDir, setFlipDir] = useState<'forward' | 'back'>('forward')
  const [calendarCursor, setCalendarCursor] = useState(calendarStartFromToday)
  const page = resolvePage()
  const calendarCursorValue = monthCursorKey(calendarCursor.year, calendarCursor.monthIndex)
  const canPrevMonth = calendarCursorValue > monthCursorKey(CALENDAR_MIN.year, CALENDAR_MIN.monthIndex)
  const canNextMonth = calendarCursorValue < monthCursorKey(CALENDAR_MAX.year, CALENDAR_MAX.monthIndex)
  const shiftCalendarMonth = (delta: number) => {
    setCalendarCursor((current) => {
      const next = new Date(current.year, current.monthIndex + delta, 1)
      return { year: next.getFullYear(), monthIndex: next.getMonth() }
    })
  }
  const weekdayLabels = [
    t('events.weekday.0'),
    t('events.weekday.1'),
    t('events.weekday.2'),
    t('events.weekday.3'),
    t('events.weekday.4'),
    t('events.weekday.5'),
    t('events.weekday.6'),
  ]
  const sortedEvents = sortEventsForDisplay(AZALEA_EVENTS)
  const volunteerPages = pagesForVolunteerYear(volunteerYear)
  const isLatestJournal = volunteerYear === LATEST_VOLUNTEER_YEAR
  const volunteerPageCount = volunteerPages.length + (isLatestJournal ? 1 : 0)
  const activeVolunteer = volunteerPage < volunteerPages.length ? volunteerPages[volunteerPage] : null
  const showingJoin = isLatestJournal && volunteerPage === volunteerPages.length

  useEffect(() => {
    if (page !== 'home') return
    const id = window.location.hash.replace(/^#/, '')
    if (!id) return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [page])

  const turnVolunteerPage = (next: number) => {
    setFlipDir(next > volunteerPage ? 'forward' : 'back')
    setVolunteerPage(next)
  }

  const openVolunteerYear = (year: number) => {
    if (year === volunteerYear) return
    setFlipDir(year < volunteerYear ? 'forward' : 'back')
    setVolunteerYear(year)
    setVolunteerPage(0)
  }

  return (
    <div className={`site-shell page-${page}`}>
      <header className="site-header">
        <div className="header-primary">
          <a className="brand" href="./" aria-label="Azalea Initiative home">
            <span className="brand-mark"><Flower2 /></span>
            <span>Azalea <em>Initiative</em></span>
          </a>
          <nav className={menuOpen ? 'open' : ''} onClick={() => setMenuOpen(false)} aria-label="Site pages">
            <a
              className="nav-home"
              href="./"
              aria-current={page === 'home' ? 'page' : undefined}
            >
              <Home size={16} aria-hidden="true" /> {t('nav.home')}
            </a>
            <a href="?page=about" aria-current={page === 'about' ? 'page' : undefined}>{t('nav.about')}</a>
            <a href="?page=local" aria-current={page === 'local' ? 'page' : undefined}>{t('nav.local')}</a>
            <a href="?page=updates" aria-current={page === 'updates' ? 'page' : undefined}>{t('nav.updates')}</a>
            <a
              className="nav-volunteer"
              href="?page=volunteer"
              aria-current={page === 'volunteer' ? 'page' : undefined}
            >
              {t('nav.volunteer')} <Users size={16} aria-hidden="true" />
            </a>
            <a href="?page=contact" aria-current={page === 'contact' ? 'page' : undefined}>{t('nav.contact')}</a>
            <a href="?page=events" aria-current={page === 'events' ? 'page' : undefined}>{t('nav.events')}</a>
            {isStaff ? (
              <a href="?page=staff" aria-current={page === 'staff' ? 'page' : undefined}>{t('nav.staff')}</a>
            ) : null}
          </nav>
        </div>
        <div className="header-right">
          <LanguageSwitch />
          <CommunityAccount />
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            <Menu />
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={14} /> {t('hero.eyebrow')}</span>
            <h1 dangerouslySetInnerHTML={{ __html: t('hero.title') }} />
            <p>{t('hero.body')}</p>
            <div className="hero-actions">
              <a className="button primary" href={WINTER_PROGRAM_HREF}>{t('hero.ctaProgram')} <ArrowRight size={18} /></a>
              <a className="button text-link" href="?page=volunteer">{t('hero.ctaJournal')} <Users size={18} /></a>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="sun"></div>
            <div className="azalea-sprig">
              <span className="azalea-leaf l1"></span>
              <span className="azalea-leaf l2"></span>
              <span className="azalea-bloom b1"><i></i></span>
              <span className="azalea-bloom b2"><i></i></span>
              <span className="azalea-bloom b3"><i></i></span>
            </div>
            <div className="postcard">
              <span className="postcard-stamp"><Flower2 /></span>
              <div className="postcard-art">
                <span className="hill back"></span>
                <span className="hill front"></span>
                <span className="paint-sun"></span>
                <span className="flower f1">✿</span>
                <span className="flower f2">✿</span>
                <span className="flower f3">✿</span>
              </div>
              <p>{t('hero.cardLine1')}<br /><em>{t('hero.cardLine2')}</em></p>
            </div>
            <span className="scribble one">hello!</span>
            <span className="scribble two">你好</span>
          </div>
          <div className="scroll-note">{t('hero.scroll')} <ArrowDown size={15} /></div>
        </section>

        <section className="winter-section" id="winter-program">
          <div className="winter-intro">
            <span className="eyebrow">{t('winter.eyebrow')}</span>
            <h2 dangerouslySetInnerHTML={{ __html: t('winter.title') }} />
            <p>{t('winter.body')}</p>
            <p className="winter-selectivity">{t('winter.selectivity')}</p>
            <div className="winter-intro-links">
              <a
                className="button primary small"
                href={WINTER_CLOSING_PLAY_VIDEO_URL}
                target="_blank"
                rel="noreferrer"
              >
                {t('winter.watchPlay')} <ArrowRight size={15} />
              </a>
              <a
                className="press-link winter-partner-link"
                href="http://www.hsiangyuan.org.tw/ap/index.aspx"
                target="_blank"
                rel="noreferrer"
              >
                {t('winter.partnerLink')} <ArrowRight size={15} />
              </a>
            </div>
          </div>
          <div className="winter-grid">
            <article>
              <CalendarDays size={22} />
              <h3>{t('winter.datesTitle')}</h3>
              <p>{t('winter.datesBody')}</p>
            </article>
            <article>
              <Users size={22} />
              <h3>{t('winter.whoTitle')}</h3>
              <p>{t('winter.whoBody')}</p>
            </article>
            <article>
              <HandHeart size={22} />
              <h3>{t('winter.serviceTitle')}</h3>
              <p>{t('winter.serviceBody')}</p>
            </article>
            <article>
              <Megaphone size={22} />
              <h3>{t('winter.costTitle')}</h3>
              <p>{t('winter.costBody')}</p>
            </article>
          </div>
          <div className="winter-panels">
            <div>
              <h3>{t('winter.applyTitle')}</h3>
              <ul>
                <li>{t('winter.apply.1')}</li>
                <li>{t('winter.apply.2')}</li>
                <li>{t('winter.apply.3')}</li>
                <li>{t('winter.apply.4')}</li>
                <li>{t('winter.apply.5')}</li>
              </ul>
            </div>
            <div>
              <h3>{t('winter.parentsTitle')}</h3>
              <ul>
                <li>{t('winter.parents.1')}</li>
                <li>{t('winter.parents.2')}</li>
                <li>{t('winter.parents.3')}</li>
                <li>{t('winter.parents.4')}</li>
              </ul>
            </div>
          </div>
          <div className="winter-actions">
            <a
              className="button primary"
              href={WINTER_INTEREST_FORM_URL}
              target="_blank"
              rel="noreferrer"
            >
              {t('winter.ctaApply')} <ArrowRight size={17} />
            </a>
            <a className="button ghost" href="?page=local">{t('winter.ctaJournal')} <Users size={17} /></a>
          </div>
        </section>

        <section className="statement" id="mission">
          <span className="eyebrow centered">{t('mission.eyebrow')}</span>
          <h2 dangerouslySetInnerHTML={{ __html: t('mission.title') }} />
          <p>{t('mission.body')}</p>
          <div className="values">
            <article>
              <span>01</span>
              <Heart />
              <h3>{t('mission.v1.title')}</h3>
              <p>{t('mission.v1.body')}</p>
            </article>
            <article>
              <span>02</span>
              <HandHeart />
              <h3>{t('mission.v2.title')}</h3>
              <p>{t('mission.v2.body')}</p>
            </article>
            <article>
              <span>03</span>
              <Sparkles />
              <h3>{t('mission.v3.title')}</h3>
              <p>{t('mission.v3.body')}</p>
            </article>
          </div>
        </section>

        <section className="quiet-art-section" id="connect">
          <p>{t('quietArt.body')}</p>
          <span className="quiet-art-soon">{t('comingSoon.badge')}</span>
        </section>

        <section className="draw-section" id="draw">
          <ComingSoonPanel />
        </section>

        <section className="message-section" id="message">
          <ComingSoonPanel />
        </section>

        <section className="gallery-section" id="gallery">
          <ComingSoonPanel />
        </section>

        <section className="updates-section" id="updates">
          <div className="chalkboard" aria-label="Caretaker updates chalkboard">
            <div className="chalk-rail" aria-hidden="true"></div>
            <div className="updates-heading">
              <span className="eyebrow chalk-eyebrow">{t('updates.eyebrow')}</span>
              <h2 dangerouslySetInnerHTML={{ __html: t('updates.title') }} />
              <p>{t('updates.body')}</p>
              <button className="button chalk-button" onClick={() => alert(t('updates.cta'))}>{t('updates.cta')} <ArrowRight size={17} /></button>
            </div>
            <div className="update-feed">
              <article className="update-post">
                <div className="update-meta"><span>{t('updates.sample')}</span><time><CalendarDays size={14} /> {t('updates.journal')}</time></div>
                <h3>{t('updates.postTitle')}</h3>
                <p>{t('updates.postBody')}</p>
                <div className="update-placeholder"><Flower2 /><span>{t('updates.media')}</span></div>
              </article>
              <aside className="community-promise">
                <span><ShieldCheck /></span>
                <p className="eyebrow chalk-eyebrow">{t('updates.promise')}</p>
                <h3>{t('updates.promiseTitle')}</h3>
                <ul>
                  <li>{t('updates.li1')}</li>
                  <li>{t('updates.li2')}</li>
                  <li>{t('updates.li3')}</li>
                  <li>{t('updates.li4')}</li>
                </ul>
                <a href="#community-guidelines">{t('updates.readGuidelines')} <ArrowRight size={15} /></a>
              </aside>
            </div>
            <div className="chalk-ledge" aria-hidden="true"><span></span><span></span><span></span></div>
          </div>
        </section>

        <section className="volunteer-section" id="volunteers">
          <div className="volunteer-heading">
            <span className="eyebrow">{t('volunteer.eyebrow')}</span>
            <h2 dangerouslySetInnerHTML={{ __html: t('volunteer.title') }} />
            <p>{t('volunteer.body')}</p>
          </div>
          <div className="sketchbook" id="volunteer-application">
            <div className="journal-years" role="tablist" aria-label={t('volunteer.yearsLabel')}>
              {VOLUNTEER_JOURNALS.map((journal) => (
                <button
                  key={journal.year}
                  type="button"
                  role="tab"
                  aria-selected={volunteerYear === journal.year}
                  onClick={() => openVolunteerYear(journal.year)}
                >
                  {journal.year}
                </button>
              ))}
            </div>
            <div className="bookmarks" role="tablist" aria-label={`${volunteerYear} ${t('volunteer.pagesLabel')}`}>
              {volunteerPages.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={volunteerPage === index}
                  onClick={() => turnVolunteerPage(index)}
                >
                  <span>0{index + 1}</span>{t(`volunteer.${item.id}.tab`)}
                </button>
              ))}
              {isLatestJournal ? (
                <button
                  type="button"
                  className="join-bookmark"
                  role="tab"
                  aria-selected={showingJoin}
                  onClick={() => turnVolunteerPage(volunteerPages.length)}
                >
                  <span>0{volunteerPages.length + 1}</span>{t('volunteer.joinTab')}
                </button>
              ) : null}
            </div>
            <div className="book-cover">
              <div className="book-spine"><Flower2 /><span>AZALEA<br />{volunteerYear}</span></div>
              <div className="book-paper-edge"></div>
              <div className={`book-spread turning-${flipDir}`} key={`${volunteerYear}-${volunteerPage}`}>
                {activeVolunteer ? (
                  <>
                    <article className="sketch-page story-page">
                      <span className="page-number">0{volunteerPage + 1}</span>
                      <div className="story-page-body">
                        <span className="hand-label">{t(`volunteer.${activeVolunteer.id}.kicker`)}</span>
                        <h3>{t(`volunteer.${activeVolunteer.id}.title`)}</h3>
                        <p>{t(`volunteer.${activeVolunteer.id}.body`)}</p>
                        {(activeVolunteer.articleUrl || activeVolunteer.videoUrl) ? (
                          <div className="story-links">
                            {activeVolunteer.videoUrl ? (
                              <a
                                className="button primary small"
                                href={activeVolunteer.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {t('volunteer.watchVideo')} <ArrowRight size={15} />
                              </a>
                            ) : null}
                            {activeVolunteer.articleUrl ? (
                              <a className="press-link" href={activeVolunteer.articleUrl} target="_blank" rel="noreferrer">
                                {t('volunteer.readStory')} {activeVolunteer.articleSource} <ArrowRight size={15} />
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                        <ul>
                          {Array.from({ length: activeVolunteer.detailCount }, (_, i) => (
                            <li key={i}>{t(`volunteer.${activeVolunteer.id}.d${i + 1}`)}</li>
                          ))}
                        </ul>
                        <small>
                          {activeVolunteer.image || activeVolunteer.images?.length
                            ? t('volunteer.fromNotes')
                            : t('volunteer.fieldNote')}
                        </small>
                      </div>
                    </article>
                    {activeVolunteer.art === 'florals' ? (
                      <div className="sketch-page floral-scatter-page" aria-hidden="true">
                        <Flower2 className="scatter-icon i1" />
                        <Flower2 className="scatter-icon i2" />
                        <Flower2 className="scatter-icon i3" />
                        <Flower2 className="scatter-icon i4" />
                        <Flower2 className="scatter-icon i5" />
                        <Flower2 className="scatter-icon i6" />
                        <Flower2 className="scatter-icon i7" />
                        <Flower2 className="scatter-icon i8" />
                        <Flower2 className="scatter-icon i9" />
                      </div>
                    ) : activeVolunteer.images?.length ? (
                      <div className="sketch-page illustrated-page press-page photo-page collage-page">
                        <div className="page-tape"></div>
                        <figure className="press-clipping collage-clipping">
                          <div className="photo-collage" aria-label={t(`volunteer.${activeVolunteer.id}.caption`)}>
                            {activeVolunteer.images.map((src) => (
                              <img key={src} src={asset(src)} alt="" />
                            ))}
                          </div>
                          <figcaption>
                            <span>{t(volunteerPhotoCredit(activeVolunteer.id))}</span>
                            {t(`volunteer.${activeVolunteer.id}.caption`)}
                          </figcaption>
                        </figure>
                      </div>
                    ) : activeVolunteer.image ? (
                      <div className={`sketch-page illustrated-page press-page${activeVolunteer.art === 'press' ? '' : ' photo-page'}`}>
                        <div className="page-tape"></div>
                        <figure className="press-clipping">
                          <img src={asset(activeVolunteer.image)} alt={t(`volunteer.${activeVolunteer.id}.caption`) || t(`volunteer.${activeVolunteer.id}.title`)} />
                          <figcaption>
                            <span>{t(volunteerPhotoCredit(activeVolunteer.id))}</span>
                            {t(`volunteer.${activeVolunteer.id}.caption`)}
                          </figcaption>
                        </figure>
                      </div>
                    ) : (
                      <div className={`sketch-page illustrated-page ${activeVolunteer.art}`} aria-hidden="true">
                        <div className="page-tape"></div>
                        <div className="activity-illustration">
                          <span className="shape s1"></span><span className="shape s2"></span><span className="shape s3"></span>
                          <Flower2 />
                        </div>
                        <p>make • learn • connect</p>
                      </div>
                    )}
                  </>
                ) : showingJoin ? (
                  <>
                    <article className="sketch-page join-page">
                      <span className="page-number">0{volunteerPages.length + 1}</span>
                      <span className="hand-label">{t('volunteer.apply.kicker')}</span>
                      <h3>{t('volunteer.apply.title')}</h3>
                      <p>{t('volunteer.apply.body')}</p>
                      <div className="join-doodle" aria-hidden="true"><Flower2 /><span dangerouslySetInnerHTML={{ __html: t('volunteer.apply.doodle') }} /></div>
                    </article>
                    <div className="sketch-page application-page">
                      <div className="application-external">
                        <p>{t('volunteer.apply.formLead')}</p>
                        <a
                          className="button primary"
                          href={LONG_TERM_RECRUITMENT_FORM_URL}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t('volunteer.apply.submitLong')} <ArrowRight size={17} />
                        </a>
                        <a
                          className="button ghost"
                          href={TEMPORARY_RECRUITMENT_FORM_URL}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t('volunteer.apply.submitTemp')} <ArrowRight size={17} />
                        </a>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
            <div className="book-controls">
              <button disabled={volunteerPage === 0} onClick={() => turnVolunteerPage(Math.max(0, volunteerPage - 1))}>{t('volunteer.prev')}</button>
              <span>{volunteerPage + 1} / {volunteerPageCount}</span>
              <button disabled={volunteerPage === volunteerPageCount - 1} onClick={() => turnVolunteerPage(Math.min(volunteerPageCount - 1, volunteerPage + 1))}>{t('volunteer.next')}</button>
            </div>
          </div>
        </section>

        <section className="guidelines-section" id="community-guidelines">
          <div><ShieldCheck /><span className="eyebrow">{t('guidelines.eyebrow')}</span><h2 dangerouslySetInnerHTML={{ __html: t('guidelines.title') }} /></div>
          <div className="guideline-list">
            <p><strong>01</strong><span dangerouslySetInnerHTML={{ __html: t('guidelines.1') }} /></p>
            <p><strong>02</strong><span dangerouslySetInnerHTML={{ __html: t('guidelines.2') }} /></p>
            <p><strong>03</strong><span dangerouslySetInnerHTML={{ __html: t('guidelines.3') }} /></p>
            <p><strong>04</strong><span dangerouslySetInnerHTML={{ __html: t('guidelines.4') }} /></p>
          </div>
        </section>

        <section className="current-mission-section" id="current-mission">
          <div className="mission-intro">
            <span className="eyebrow">{t('fund.eyebrow')}</span>
            <h2 dangerouslySetInnerHTML={{ __html: t('fund.title') }} />
            <p>{t('fund.body')}</p>
          </div>
          <div className="bulletin-board">
            <span className="pushpin pin-one"></span>
            <span className="pushpin pin-two"></span>
            <span className="tape tape-one"></span>
            <span className="tape tape-two"></span>
            <article className="mission-note">
              <span className="hand-label">{t('fund.note')}</span>
              <h3>{t('fund.cardTitle')}</h3>
            </article>
            <div className="mission-postcard" aria-hidden="true">
              <div className="postcard-sky"><span>✿</span><span>✿</span><span>✿</span></div>
              <p>{t('fund.postcard')}</p>
              <small>{t('fund.route')}</small>
            </div>
            <div className="fund-card">
              <div className="fund-top">
                <span>{t('fund.goalLabel')}</span>
                <strong className="fund-goal">$10,000</strong>
                <p className="fund-purpose">{t('fund.purpose')}</p>
              </div>
              <aside className="fund-status-note" aria-label="Fundraising status">
                <p className="fund-status-title">{t('fund.statusTitle')}</p>
                <p>{t('fund.statusBody')}</p>
              </aside>
            </div>
          </div>
        </section>

        <section className="donation-section" id="donate">
          <div className="donation-heading">
            <span className="eyebrow">{t('donate.eyebrow')}</span>
            <h2 dangerouslySetInnerHTML={{ __html: t('donate.title') }} />
            <p>{t('donate.body')}</p>
          </div>
          <div className="giving-grid">
            <article><span><HandHeart /></span><h3>{t('donate.g1.title')}</h3><p>{t('donate.g1.body')}</p></article>
            <article><span><Megaphone /></span><h3>{t('donate.g2.title')}</h3><p>{t('donate.g2.body')}</p></article>
            <article><span><Users /></span><h3>{t('donate.g3.title')}</h3><p>{t('donate.g3.body')}</p></article>
          </div>
          <div className="overall-giving-card">
            <div>
              <span className="eyebrow">{t('donate.fundEyebrow')}</span>
              <h3>{t('donate.fundTitle')}</h3>
              <p>{t('donate.fundBody')}</p>
            </div>
            <aside className="fund-status-note" aria-label="Donation status">
              <p className="fund-status-title">{t('donate.statusTitle')}</p>
              <p>{t('donate.statusBody')}</p>
              <a className="button primary small" href={WINTER_PROGRAM_HREF}>{t('donate.winterCta')} <ArrowRight size={15} /></a>
            </aside>
          </div>
        </section>
        <section className="events-section" id="events">
          <div className="events-intro">
            <span className="eyebrow">{t('events.eyebrow')}</span>
            <h2 dangerouslySetInnerHTML={{ __html: t('events.title') }} />
            <p>{t('events.body')}</p>
          </div>
          <div className="events-layout">
            <div className="events-calendars" aria-label={t('events.calendarLabel')}>
              <MonthCalendar
                year={calendarCursor.year}
                monthIndex={calendarCursor.monthIndex}
                events={AZALEA_EVENTS}
                weekdayLabels={weekdayLabels}
                onPrev={() => shiftCalendarMonth(-1)}
                onNext={() => shiftCalendarMonth(1)}
                canPrev={canPrevMonth}
                canNext={canNextMonth}
              />
            </div>
            <div className="events-list">
              {sortedEvents.map((event) => (
                <article key={event.id} className="event-card">
                  <CalendarDays size={22} aria-hidden="true" />
                  <p className="event-dates">{t(event.datesKey)}</p>
                  <h3>{t(event.titleKey)}</h3>
                  <p>{t(event.bodyKey)}</p>
                  <div className="event-card-actions">
                    <a className="button primary" href={event.href}>
                      {t(event.ctaKey)} <ArrowRight size={16} />
                    </a>
                    {event.secondaryCtaKey && event.secondaryHref ? (
                      <a
                        className="button ghost"
                        href={event.secondaryHref}
                        {...(event.secondaryExternal
                          ? { target: '_blank', rel: 'noreferrer' }
                          : {})}
                      >
                        {t(event.secondaryCtaKey)} <ArrowRight size={16} />
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="local-section" id="local">
          <div className="local-intro">
            <span className="eyebrow">{t('local.eyebrow')}</span>
            <h2 dangerouslySetInnerHTML={{ __html: t('local.title') }} />
            <p>{t('local.body')}</p>
          </div>
          <div className="local-grid">
            <article className="local-card featured">
              <HandHeart size={22} aria-hidden="true" />
              <p className="local-when">{t('local.learners.when')}</p>
              <h3>{t('local.learners.title')}</h3>
              <p>{t('local.learners.body')}</p>
              <ul>
                <li>{t('local.learners.d1')}</li>
                <li>{t('local.learners.d2')}</li>
                <li>{t('local.learners.d3')}</li>
              </ul>
              <a
                className="button primary"
                href={TEMPORARY_RECRUITMENT_FORM_URL}
                target="_blank"
                rel="noreferrer"
              >
                {t('local.learners.cta')} <ArrowRight size={16} />
              </a>
            </article>
            <article className="local-card">
              <Shirt size={22} aria-hidden="true" />
              <p className="local-when">{t('local.tshirt.when')}</p>
              <h3>{t('local.tshirt.title')}</h3>
              <p>{t('local.tshirt.body')}</p>
              <ul>
                <li>{t('local.tshirt.d1')}</li>
                <li>{t('local.tshirt.d2')}</li>
                <li>{t('local.tshirt.d3')}</li>
              </ul>
              <a
                className="button primary"
                href={TEMPORARY_RECRUITMENT_FORM_URL}
                target="_blank"
                rel="noreferrer"
              >
                {t('local.tshirt.cta')} <ArrowRight size={16} />
              </a>
            </article>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-intro">
            <span className="eyebrow">{t('contact.eyebrow')}</span>
            <h2 dangerouslySetInnerHTML={{ __html: t('contact.title') }} />
            <p>{t('contact.body')}</p>
          </div>
          <div className="contact-grid">
            <article className="contact-card preferred">
              <Mail size={22} aria-hidden="true" />
              <h3>{t('contact.emailPreferredTitle')}</h3>
              <p>{t('contact.emailPreferredBody')}</p>
              <a className="button primary" href="mailto:sjazaleainitiative@gmail.com">sjazaleainitiative@gmail.com</a>
            </article>
            <article className="contact-card">
              <Mail size={22} aria-hidden="true" />
              <h3>{t('contact.emailAltTitle')}</h3>
              <p>{t('contact.emailAltBody')}</p>
              <a className="button ghost" href="mailto:theazaleainiative@gmail.com">theazaleainiative@gmail.com</a>
            </article>
            <article className="contact-card">
              <span className="ig-glyph contact-ig" aria-hidden="true" />
              <h3>{t('contact.instagramTitle')}</h3>
              <p>{t('contact.instagramBody')}</p>
              <div className="contact-instagram-links">
                <a href="https://www.instagram.com/theazaleainitiative/" target="_blank" rel="noreferrer">
                  <span className="ig-glyph" aria-hidden="true" /> @theazaleainitiative
                </a>
                <a href="https://www.instagram.com/theazaleainitiative.sj/" target="_blank" rel="noreferrer">
                  <span className="ig-glyph" aria-hidden="true" /> @theazaleainitiative.sj
                </a>
              </div>
            </article>
          </div>
        </section>

        <StatusTracker initialCode={new URLSearchParams(window.location.search).get('code') || ''} />
        <StaffWorkspace />

      </main>

      <footer>
        <div className="footer-brand">
          <a className="brand" href="./"><span className="brand-mark"><Flower2 /></span><span>Azalea <em>Initiative</em></span></a>
          <p>{t('footer.tagline')}</p>
        </div>
        <div className="footer-links">
          <div><strong>{t('footer.explore')}</strong><a href={WINTER_PROGRAM_HREF}>{t('hero.ctaProgram')}</a><a href="?page=events">{t('nav.events')}</a><a href="?page=about">{t('footer.mission')}</a></div>
          <div><strong>{t('footer.involved')}</strong><a href="?page=local">{t('nav.local')}</a><a href="?page=volunteer">{t('footer.volunteer')}</a><a href="?page=contact">{t('nav.contact')}</a><a href="?page=about#donate">{t('footer.donate')}</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Azalea Initiative</span><span>{t('footer.care')}</span></div>
      </footer>
    </div>
  )
}

export default App
