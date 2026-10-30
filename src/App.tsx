import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  Brush,
  CalendarDays,
  Check,
  Flower2,
  HandHeart,
  Heart,
  Mail,
  Megaphone,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import './App.css'
import CommunityAccount from './components/CommunityAccount'
import DrawingStudio from './components/DrawingStudio'
import StaffWorkspace from './components/StaffWorkspace'
import StatusTracker from './components/StatusTracker'
import { LanguageSwitch, useLanguage } from './i18n/LanguageContext'
import { asset } from './lib/asset'
import { displaySenderName, submitVolunteerApplication } from './platform/store'
import { usePlatform } from './platform/usePlatform'

type VolunteerPageMeta = {
  id: 'why' | 'camp' | 'press'
  art: string
  articleUrl?: string
  articleSource?: string
  image?: string
  detailCount: number
}

const VOLUNTEER_PAGES: VolunteerPageMeta[] = [
  { id: 'why', art: 'florals', detailCount: 3 },
  {
    id: 'camp',
    art: 'garden',
    image: 'press/together-we-shine.jpg',
    detailCount: 4,
  },
  {
    id: 'press',
    art: 'press',
    articleUrl: 'https://hoomedia.com.tw/2025/07/02/76051/',
    articleSource: '互傳媒 Hoo Media',
    image: 'press/hoomedia-camping.jpg',
    detailCount: 3,
  },
]

const CONNECT_PAGES = ['draw', 'thank', 'view'] as const
type SitePage = 'home' | 'draw' | 'thank' | 'view' | 'updates' | 'volunteer' | 'staff' | 'status'

function resolvePage(): SitePage {
  const requested = new URLSearchParams(window.location.search).get('page')
  if (
    requested === 'draw'
    || requested === 'thank'
    || requested === 'view'
    || requested === 'updates'
    || requested === 'volunteer'
    || requested === 'staff'
    || requested === 'status'
  ) {
    return requested
  }
  return 'home'
}

function App() {
  const { t } = useLanguage()
  const { submissions, user } = usePlatform()
  const isStaff = user?.kind === 'staff'
  const [menuOpen, setMenuOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  const [applicationSent, setApplicationSent] = useState(false)
  const [volunteerPage, setVolunteerPage] = useState(0)
  const [flipDir, setFlipDir] = useState<'forward' | 'back'>('forward')
  const page = resolvePage()
  const sendActive = CONNECT_PAGES.includes(page as typeof CONNECT_PAGES[number])
  const gardenArt = submissions
    .filter((item) => item.status !== 'rejected' && Boolean(item.imageDataUrl))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const gardenMats = ['staff-art-sun', 'staff-art-sky', 'staff-art-bloom'] as const
  const activeVolunteer = volunteerPage < VOLUNTEER_PAGES.length ? VOLUNTEER_PAGES[volunteerPage] : null

  useEffect(() => {
    if (!sendOpen) return
    const close = () => setSendOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [sendOpen])

  const turnVolunteerPage = (next: number) => {
    setFlipDir(next > volunteerPage ? 'forward' : 'back')
    setVolunteerPage(next)
  }

  return (
    <div className={`site-shell page-${page}`}>
      <header className="site-header">
        <div className="header-left">
          <LanguageSwitch />
          <CommunityAccount />
          <a className="brand" href="./" aria-label="Azalea Initiative home">
            <span className="brand-mark"><Flower2 /></span>
            <span>Azalea <em>Initiative</em></span>
          </a>
        </div>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"><Menu /></button>
        <nav className={menuOpen ? 'open' : ''} onClick={() => setMenuOpen(false)}>
          <div className="nav-home-group" aria-label="Homepage sections">
            <a href="./#mission">{t('nav.mission')}</a>
            <div
              className={`nav-dropdown${sendOpen ? ' open' : ''}${sendActive ? ' active' : ''}`}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="nav-link-button nav-dropdown-toggle"
                aria-expanded={sendOpen}
                aria-haspopup="menu"
                onClick={() => setSendOpen((open) => !open)}
              >
                {t('nav.send')} <span className="nav-caret" aria-hidden="true" />
              </button>
              <div className="nav-dropdown-menu" role="menu" hidden={!sendOpen}>
                <a role="menuitem" href="?page=draw" aria-current={page === 'draw' ? 'page' : undefined}>{t('nav.draw')}</a>
                <a role="menuitem" href="?page=thank" aria-current={page === 'thank' ? 'page' : undefined}>{t('nav.thank')}</a>
                <a role="menuitem" href="?page=view" aria-current={page === 'view' ? 'page' : undefined}>{t('nav.view')}</a>
              </div>
            </div>
            <a href="./#current-mission">{t('nav.current')}</a>
            <a className="nav-cta" href="./#donate">{t('nav.donate')} <ArrowRight size={16} /></a>
          </div>
          <a href="?page=updates" aria-current={page === 'updates' ? 'page' : undefined}>{t('nav.updates')}</a>
          <a href="?page=volunteer" aria-current={page === 'volunteer' ? 'page' : undefined}>{t('nav.volunteer')}</a>
          <a href="?page=status" aria-current={page === 'status' ? 'page' : undefined}>{t('nav.track')}</a>
          {isStaff ? (
            <a href="?page=staff" aria-current={page === 'staff' ? 'page' : undefined}>{t('nav.staff')}</a>
          ) : null}
        </nav>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={14} /> {t('hero.eyebrow')}</span>
            <h1 dangerouslySetInnerHTML={{ __html: t('hero.title') }} />
            <p>{t('hero.body')}</p>
            <div className="hero-actions">
              <a className="button primary" href="?page=draw">{t('hero.ctaDraw')} <Brush size={18} /></a>
              <a className="button text-link" href="#mission">{t('hero.ctaMission')} <ArrowDown size={18} /></a>
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
              <Mail />
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

        <section className="draw-section" id="draw">
          <DrawingStudio embedded onClose={() => { window.location.href = './' }} />
        </section>

        <section className="connect-section" id="connect">
          <div className="section-heading">
            <span className="eyebrow">{t('connect.eyebrow')}</span>
            <h2 dangerouslySetInnerHTML={{ __html: t('connect.title') }} />
          </div>
          <div className="connection-grid">
            <a className="connection-card coral" href="?page=draw">
              <span className="card-number">01</span>
              <span className="card-icon"><Brush /></span>
              <span>
                <strong>{t('connect.draw.title')}</strong>
                <small>{t('connect.draw.body')}</small>
              </span>
              <ArrowRight className="card-arrow" />
            </a>
            <a className="connection-card blue" href="?page=thank">
              <span className="card-number">02</span>
              <span className="card-icon"><Mail /></span>
              <span>
                <strong>{t('connect.thank.title')}</strong>
                <small>{t('connect.thank.body')}</small>
              </span>
              <ArrowRight className="card-arrow" />
            </a>
            <a className="connection-card gold" href="?page=view">
              <span className="card-number">03</span>
              <span className="card-icon"><Sparkles /></span>
              <span>
                <strong>{t('connect.view.title')}</strong>
                <small>{t('connect.view.body')}</small>
              </span>
              <ArrowRight className="card-arrow" />
            </a>
          </div>
        </section>

        <section className="message-section" id="message">
          <div className="message-copy">
            <span className="eyebrow">{t('message.eyebrow')}</span>
            <h2 dangerouslySetInnerHTML={{ __html: t('message.title') }} />
            <p>{t('message.body')}</p>
            <div className="translation-note"><span>EN</span><div></div><span>繁</span> {t('message.translate')}</div>
          </div>
          <div className="note-card">
            {messageSent ? (
              <div className="note-success">
                <span><Check /></span>
                <h3>{t('message.thanksTitle')}</h3>
                <p>{t('message.thanksBody')}</p>
                <button className="text-button" onClick={() => setMessageSent(false)}>{t('message.writeAnother')}</button>
              </div>
            ) : (
              <form onSubmit={(event) => { event.preventDefault(); setMessageSent(true) }}>
                <label htmlFor="note">{t('message.dear')}</label>
                <textarea id="note" required maxLength={500} placeholder={t('message.placeholder')} />
                <div className="form-footer">
                  <span>{t('message.nameOptional')}</span>
                  <input aria-label={t('message.firstName')} placeholder={t('message.firstName')} maxLength={40} />
                  <button className="round-submit" aria-label={t('message.send')}><ArrowRight /></button>
                </div>
              </form>
            )}
          </div>
        </section>

        <section className="gallery-section" id="gallery">
          <div className="section-heading inline">
            <div>
              <span className="eyebrow">{t('gallery.eyebrow')}</span>
              <h2 dangerouslySetInnerHTML={{ __html: t('gallery.title') }} />
            </div>
            <p>{t('gallery.body')}</p>
          </div>
          {gardenArt.length === 0 ? (
            <p className="staff-gallery-empty">{t('gallery.empty')}</p>
          ) : (
            <div className="gallery-row staff-gallery-row" aria-label={t('gallery.label')}>
              {gardenArt.map((item, index) => (
                <article key={item.id} className={`art-card ${gardenMats[index % gardenMats.length]}`}>
                  <div className="staff-art-frame">
                    <img src={item.imageDataUrl} alt="" />
                  </div>
                  <p>{displaySenderName(item.senderName, t('sender.anonymous'))}</p>
                  <small>{item.note?.trim() || new Date(item.createdAt).toLocaleDateString()}</small>
                </article>
              ))}
            </div>
          )}
          <p className="gallery-caption"><Sparkles size={15} /> {t('gallery.caption')}</p>
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
          <div className="volunteer-florals" aria-hidden="true">
            <img className="floral top-left" src={asset('florals/azalea-top-left.png')} alt="" />
            <img className="floral top-right" src={asset('florals/azalea-top-right.png?v=2')} alt="" />
            <img className="floral bottom-left" src={asset('florals/azalea-bottom-left.png')} alt="" />
            <img className="floral bottom-right" src={asset('florals/azalea-bottom-right.png')} alt="" />
          </div>
          <div className="volunteer-heading">
            <span className="eyebrow">{t('volunteer.eyebrow')}</span>
            <h2 dangerouslySetInnerHTML={{ __html: t('volunteer.title') }} />
            <p>{t('volunteer.body')}</p>
          </div>
          <div className="sketchbook" id="volunteer-application">
            <div className="bookmarks" role="tablist" aria-label="Volunteer sketchbook pages">
              {VOLUNTEER_PAGES.map((item, index) => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={volunteerPage === index}
                  onClick={() => turnVolunteerPage(index)}
                >
                  <span>0{index + 1}</span>{t(`volunteer.${item.id}.tab`)}
                </button>
              ))}
              <button
                className="join-bookmark"
                role="tab"
                aria-selected={volunteerPage === VOLUNTEER_PAGES.length}
                onClick={() => turnVolunteerPage(VOLUNTEER_PAGES.length)}
              >
                <span>05</span>{t('volunteer.joinTab')}
              </button>
            </div>
            <div className="book-cover">
              <div className="book-spine"><Flower2 /><span>AZALEA<br />FIELD NOTES</span></div>
              <div className="book-paper-edge"></div>
              <div className={`book-spread turning-${flipDir}`} key={volunteerPage}>
                {activeVolunteer ? (
                  <>
                    <article className="sketch-page story-page">
                      <span className="page-number">0{volunteerPage + 1}</span>
                      <div className="story-page-body">
                        <span className="hand-label">{t(`volunteer.${activeVolunteer.id}.kicker`)}</span>
                        <h3>{t(`volunteer.${activeVolunteer.id}.title`)}</h3>
                        <p>{t(`volunteer.${activeVolunteer.id}.body`)}</p>
                        <ul>
                          {Array.from({ length: activeVolunteer.detailCount }, (_, i) => (
                            <li key={i}>{t(`volunteer.${activeVolunteer.id}.d${i + 1}`)}</li>
                          ))}
                        </ul>
                        {activeVolunteer.articleUrl ? (
                          <a className="press-link" href={activeVolunteer.articleUrl} target="_blank" rel="noreferrer">
                            {t('volunteer.readStory')} {activeVolunteer.articleSource} <ArrowRight size={15} />
                          </a>
                        ) : null}
                        <small>
                          {activeVolunteer.image
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
                    ) : activeVolunteer.image ? (
                      <div className={`sketch-page illustrated-page press-page${activeVolunteer.art === 'press' ? '' : ' photo-page'}`}>
                        <div className="page-tape"></div>
                        <figure className="press-clipping">
                          <img src={asset(activeVolunteer.image)} alt={t(`volunteer.${activeVolunteer.id}.caption`) || t(`volunteer.${activeVolunteer.id}.title`)} />
                          <figcaption>
                            <span>{activeVolunteer.art === 'press' ? t('volunteer.press.credit') : t('volunteer.ourVolunteers')}</span>
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
                ) : (
                  <>
                    <article className="sketch-page join-page">
                      <span className="page-number">0{VOLUNTEER_PAGES.length + 1}</span>
                      <span className="hand-label">{t('volunteer.apply.kicker')}</span>
                      <h3>{t('volunteer.apply.title')}</h3>
                      <p>{t('volunteer.apply.body')}</p>
                      <div className="join-doodle" aria-hidden="true"><Flower2 /><span dangerouslySetInnerHTML={{ __html: t('volunteer.apply.doodle') }} /></div>
                    </article>
                    <div className="sketch-page application-page">
                      {applicationSent ? (
                        <div className="application-success">
                          <span><Check /></span>
                          <div>
                            <h3>{t('volunteer.apply.thanksTitle')}</h3>
                            <p>{t('volunteer.apply.thanksBody')}</p>
                          </div>
                          <button className="text-button" onClick={() => setApplicationSent(false)}>{t('volunteer.apply.return')}</button>
                        </div>
                      ) : (
                        <form
                          onSubmit={async (event) => {
                            event.preventDefault()
                            const form = event.currentTarget
                            const data = new FormData(form)
                            try {
                              const result = await submitVolunteerApplication({
                                firstName: String(data.get('firstName') || ''),
                                email: String(data.get('email') || ''),
                                stage: String(data.get('stage') || ''),
                                interest: String(data.get('interest') || ''),
                                motivation: String(data.get('motivation') || ''),
                              })
                              setApplicationSent(true)
                              form.reset()
                              window.open(result.mailto, '_self')
                            } catch (error) {
                              alert(error instanceof Error ? error.message : t('volunteer.apply.error'))
                            }
                          }}
                        >
                          <label>{t('volunteer.apply.firstName')}<input required name="firstName" autoComplete="given-name" /></label>
                          <label>{t('volunteer.apply.email')}<input required type="email" name="email" autoComplete="email" /></label>
                          <label>{t('volunteer.apply.stage')}<select required name="stage" defaultValue=""><option value="" disabled>{t('volunteer.apply.select')}</option><option>{t('volunteer.apply.stage.hs')}</option><option>{t('volunteer.apply.stage.college')}</option><option>{t('volunteer.apply.stage.community')}</option></select></label>
                          <label>{t('volunteer.apply.interest')}<select required name="interest" defaultValue=""><option value="" disabled>{t('volunteer.apply.select')}</option><option>{t('volunteer.apply.interest.fund')}</option><option>{t('volunteer.apply.interest.art')}</option><option>{t('volunteer.apply.interest.outreach')}</option><option>{t('volunteer.apply.interest.translation')}</option><option>{t('volunteer.apply.interest.web')}</option></select></label>
                          <label className="wide">{t('volunteer.apply.why')}<textarea required name="motivation" maxLength={600} /></label>
                          <button className="button primary" type="submit">{t('volunteer.apply.submit')} <ArrowRight size={17} /></button>
                        </form>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="book-controls">
              <button disabled={volunteerPage === 0} onClick={() => turnVolunteerPage(Math.max(0, volunteerPage - 1))}>{t('volunteer.prev')}</button>
              <span>{volunteerPage + 1} / {VOLUNTEER_PAGES.length + 1}</span>
              <button disabled={volunteerPage === VOLUNTEER_PAGES.length} onClick={() => turnVolunteerPage(Math.min(VOLUNTEER_PAGES.length, volunteerPage + 1))}>{t('volunteer.next')}</button>
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
              <a className="button ghost small" href="?page=draw">{t('donate.drawInstead')}</a>
            </aside>
          </div>
        </section>
        <StatusTracker initialCode={new URLSearchParams(window.location.search).get('code') || ''} />
        <StaffWorkspace />

      </main>

      <footer>
        <div className="footer-brand">
          <a className="brand" href="./"><span className="brand-mark"><Flower2 /></span><span>Azalea <em>Initiative</em></span></a>
          <p>{t('footer.tagline')}</p>
          <div className="footer-social" aria-label="Instagram">
            <a href="https://www.instagram.com/theazaleainitiative/" target="_blank" rel="noreferrer">
              <span className="ig-glyph" aria-hidden="true" /> @theazaleainitiative
            </a>
            <a href="https://www.instagram.com/theazaleainitiative.sj/" target="_blank" rel="noreferrer">
              <span className="ig-glyph" aria-hidden="true" /> @theazaleainitiative.sj
            </a>
          </div>
        </div>
        <div className="footer-links">
          <div><strong>{t('footer.explore')}</strong><a href="./#mission">{t('footer.mission')}</a><a href="?page=updates">{t('footer.updates')}</a><a href="./#current-mission">{t('footer.current')}</a></div>
          <div><strong>{t('footer.involved')}</strong><a href="?page=draw">{t('footer.art')}</a><a href="?page=volunteer">{t('footer.volunteer')}</a><a href="./#donate">{t('footer.donate')}</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Azalea Initiative</span><span>{t('footer.care')}</span></div>
      </footer>
    </div>
  )
}

export default App
