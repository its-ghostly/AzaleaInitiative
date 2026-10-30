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
import { displaySenderName, submitVolunteerApplication } from './platform/store'
import { usePlatform } from './platform/usePlatform'

type VolunteerPage = {
  tab: string
  kicker: string
  title: string
  description: string
  details: string[]
  art: string
  articleUrl?: string
  articleSource?: string
  image?: string
  caption?: string
}

const VOLUNTEER_PAGES: VolunteerPage[] = [
  {
    tab: 'Why we volunteer',
    kicker: 'Our shared purpose',
    title: 'Show up with care.',
    description: 'Azalea volunteers help Bay Area neighbors and partner caretakers in Taiwan feel connected—through art, presence, and small acts of kindness. We center dignity, listen first, and treat every exchange as mutual, never charity.',
    details: [
      'Build real relationships across ability and distance',
      'Support caretakers and participants with respect',
      'Make kindness visible through art and service',
    ],
    art: 'logo',
    image: '/brand/azalea-logo.svg',
    caption: 'Azalea Initiative',
  },
  {
    tab: 'Summer camp',
    kicker: 'July 21–23, 2025 · Vista, CA',
    title: 'Together We Shine',
    description:
      'An inclusive overnight camp at Sunset Paradise themed “Together We Shine” / “Our Camp Story”—celebrating individuality and teamwork. We fostered empathy through cooperative play, kept calm sensory spaces and predictable routines, and made room for creativity, movement, and self-expression. CPR training was included for the team.',
    details: [
      'Drop-off July 21, 5–6pm · Pick-up July 23, 10:30am',
      'Welcome circles, art, cooking, talent show & farewell mural',
      'Quiet zones, visual schedules, choice boards & peer buddies',
      'Counselors: Mrs Ann, Beverly, Mona, Celine, Fred, Jessie · Campers: Trent, Leah, Hannah, Roy',
    ],
    art: 'garden',
    image: '/press/together-we-shine.jpg',
    caption: 'Together We Shine — campers and counselors at Sunset Paradise, Vista.',
  },
  {
    tab: 'Press story',
    kicker: 'In the news · July 2025',
    title: 'Glamping dreams by the sea',
    description: 'Nine U.S. student volunteers partnered with Xiangyuan Memorial Home for a two-day glamping trip at Xiang Hai Na Yang in Taichung—many residents’ first overnight camping adventure under the stars, with games, hot pot, and care that needed no shared language.',
    details: ['Xiangyuan partnership', 'First-time camping trip', 'Student-led service'],
    art: 'press',
    articleUrl: 'https://hoomedia.com.tw/2025/07/02/76051/',
    articleSource: '互傳媒 Hoo Media',
    image: '/press/hoomedia-camping.jpg',
    caption: 'International volunteers and Xiangyuan residents on their dream camping trip.',
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
  const { submissions } = usePlatform()
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
          <a href="?page=staff" aria-current={page === 'staff' ? 'page' : undefined}>{t('nav.staff')}</a>
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
              <p>Made with care,<br /><em>just for you.</em></p>
            </div>
            <span className="scribble one">hello!</span>
            <span className="scribble two">你好</span>
          </div>
          <div className="scroll-note">Scroll to explore <ArrowDown size={15} /></div>
        </section>

        <section className="statement" id="mission">
          <span className="eyebrow centered">What we believe</span>
          <h2>Disability is part of the human story.<br /><em>Connection should be, too.</em></h2>
          <a className="button primary statement-cta" href="?page=draw">Send a drawing <Brush size={18} /></a>
          <p>We create accessible ways for young people and local communities to learn, volunteer, and build genuine relationships across age, ability, and distance.</p>
          <div className="values">
            <article>
              <span>01</span>
              <Heart />
              <h3>Dignity, always</h3>
              <p>We center people, not diagnoses—and ask before we tell someone else’s story.</p>
            </article>
            <article>
              <span>02</span>
              <Mail />
              <h3>Small acts matter</h3>
              <p>A thoughtful note or handmade picture can turn distance into belonging.</p>
            </article>
            <article>
              <span>03</span>
              <Sparkles />
              <h3>Joy goes both ways</h3>
              <p>This is an exchange, not charity. Everyone has something meaningful to share.</p>
            </article>
          </div>
        </section>

        <section className="draw-section" id="draw">
          <DrawingStudio embedded onClose={() => { window.location.href = './' }} />
        </section>

        <section className="connect-section" id="connect">
          <div className="section-heading">
            <span className="eyebrow">Choose your way to connect</span>
            <h2>Send a little warmth<br /><em>across the world.</em></h2>
          </div>
          <div className="connection-grid">
            <a className="connection-card coral" href="?page=draw">
              <span className="card-number">01</span>
              <span className="card-icon"><Brush /></span>
              <span>
                <strong>Draw a picture</strong>
                <small>Create art to color, display, and enjoy.</small>
              </span>
              <ArrowRight className="card-arrow" />
            </a>
            <a className="connection-card blue" href="?page=thank">
              <span className="card-number">02</span>
              <span className="card-icon"><Mail /></span>
              <span>
                <strong>Thank a caregiver</strong>
                <small>Send encouragement to the team in Taiwan.</small>
              </span>
              <ArrowRight className="card-arrow" />
            </a>
            <a className="connection-card gold" href="?page=view">
              <span className="card-number">03</span>
              <span className="card-icon"><Sparkles /></span>
              <span>
                <strong>Explore the gallery</strong>
                <small>Discover art and stories shared with permission.</small>
              </span>
              <ArrowRight className="card-arrow" />
            </a>
          </div>
        </section>

        <section className="message-section" id="message">
          <div className="message-copy">
            <span className="eyebrow">To the people who care</span>
            <h2>Words can carry<br /><em>a long way.</em></h2>
            <p>Caregivers make meaningful moments possible every day. Write a short note—we’ll help translate and deliver approved messages.</p>
            <div className="translation-note"><span>EN</span><div></div><span>繁</span> English to Traditional Chinese</div>
          </div>
          <div className="note-card">
            {messageSent ? (
              <div className="note-success">
                <span><Check /></span>
                <h3>Thank you for sharing kindness.</h3>
                <p>This prototype hasn’t uploaded your message. Submission and moderation are part of the next build.</p>
                <button className="text-button" onClick={() => setMessageSent(false)}>Write another</button>
              </div>
            ) : (
              <form onSubmit={(event) => { event.preventDefault(); setMessageSent(true) }}>
                <label htmlFor="note">Dear caregiver,</label>
                <textarea id="note" required maxLength={500} placeholder="Thank you for the patience, care, and joy you bring each day..." />
                <div className="form-footer">
                  <span>Your first name is optional</span>
                  <input aria-label="First name" placeholder="First name" maxLength={40} />
                  <button className="round-submit" aria-label="Send message"><ArrowRight /></button>
                </div>
              </form>
            )}
          </div>
        </section>

        <section className="gallery-section" id="gallery">
          <div className="section-heading inline">
            <div>
              <span className="eyebrow">The shared garden</span>
              <h2>Art that belongs<br /><em>to everyone.</em></h2>
            </div>
            <p>Drawings shared by our community bloom here—never ranked, sold, or reduced to a prize. Visit and contribute to help the garden grow.</p>
          </div>
          {gardenArt.length === 0 ? (
            <p className="staff-gallery-empty">The garden is still waiting. Create a drawing to plant the first flower.</p>
          ) : (
            <div className="gallery-row staff-gallery-row" aria-label="Community artwork gallery">
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
          <p className="gallery-caption"><Sparkles size={15} /> Art that belongs to everyone.</p>
        </section>

        <section className="updates-section" id="updates">
          <div className="chalkboard" aria-label="Caretaker updates chalkboard">
            <div className="chalk-rail" aria-hidden="true"></div>
            <div className="updates-heading">
              <span className="eyebrow chalk-eyebrow">From our partner caretakers</span>
              <h2>Notes from<br /><em>day to day.</em></h2>
              <p>Trained facility caretakers will share consent-approved activities, celebrations, and community notes here—clear, kind, and person-first.</p>
              <button className="button chalk-button" onClick={() => alert('The invitation-only caretaker workspace will be added with the moderated community platform.')}>Caretaker workspace coming soon <ArrowRight size={17} /></button>
            </div>
            <div className="update-feed">
              <article className="update-post">
                <div className="update-meta"><span>Sample update</span><time><CalendarDays size={14} /> Activity journal</time></div>
                <h3>A creative afternoon together</h3>
                <p>Caretakers will be able to post approved photos of artwork, activity recaps, and messages from participating artists—without exposing private health or contact information.</p>
                <div className="update-placeholder"><Flower2 /><span>Consent-approved media</span></div>
              </article>
              <aside className="community-promise">
                <span><ShieldCheck /></span>
                <p className="eyebrow chalk-eyebrow">Our community promise</p>
                <h3>Kind, safe, and person-first.</h3>
                <ul>
                  <li>Get permission before sharing someone’s story.</li>
                  <li>Encourage—never pity, diagnose, or criticize.</li>
                  <li>Keep contact details and private information private.</li>
                  <li>Credit artists and respect their remix choices.</li>
                </ul>
                <a href="#community-guidelines">Read the full guidelines <ArrowRight size={15} /></a>
              </aside>
            </div>
            <div className="chalk-ledge" aria-hidden="true"><span></span><span></span><span></span></div>
          </div>
        </section>

        <section className="volunteer-section" id="volunteers">
          <div className="volunteer-florals" aria-hidden="true">
            <img className="floral top-left" src="/florals/azalea-top-left.png" alt="" />
            <img className="floral top-right" src="/florals/azalea-top-right.png?v=2" alt="" />
            <img className="floral bottom-left" src="/florals/azalea-bottom-left.png" alt="" />
            <img className="floral bottom-right" src="/florals/azalea-bottom-right.png" alt="" />
          </div>
          <div className="volunteer-heading">
            <span className="eyebrow">The volunteer journal</span>
            <h2>Open our<br /><em>sketchbook.</em></h2>
            <p>Browse sample activity pages, then flip to the final bookmark when you’re ready to imagine your place on the team.</p>
          </div>
          <div className="sketchbook" id="volunteer-application">
            <div className="bookmarks" role="tablist" aria-label="Volunteer sketchbook pages">
              {VOLUNTEER_PAGES.map((item, index) => (
                <button
                  key={item.tab}
                  role="tab"
                  aria-selected={volunteerPage === index}
                  onClick={() => turnVolunteerPage(index)}
                >
                  <span>0{index + 1}</span>{item.tab}
                </button>
              ))}
              <button
                className="join-bookmark"
                role="tab"
                aria-selected={volunteerPage === VOLUNTEER_PAGES.length}
                onClick={() => turnVolunteerPage(VOLUNTEER_PAGES.length)}
              >
                <span>05</span>Join the team
              </button>
            </div>
            <div className="book-cover">
              <div className="book-spine"><Flower2 /><span>AZALEA<br />FIELD NOTES</span></div>
              <div className="book-paper-edge"></div>
              <div className={`book-spread turning-${flipDir}`} key={volunteerPage}>
                {volunteerPage < VOLUNTEER_PAGES.length ? (
                  <>
                    <article className="sketch-page story-page">
                      <span className="page-number">0{volunteerPage + 1}</span>
                      <div className="story-page-body">
                        <span className="hand-label">{VOLUNTEER_PAGES[volunteerPage].kicker}</span>
                        <h3>{VOLUNTEER_PAGES[volunteerPage].title}</h3>
                        <p>{VOLUNTEER_PAGES[volunteerPage].description}</p>
                        <ul>
                          {VOLUNTEER_PAGES[volunteerPage].details.map((detail) => <li key={detail}>{detail}</li>)}
                        </ul>
                        {VOLUNTEER_PAGES[volunteerPage].articleUrl ? (
                          <a className="press-link" href={VOLUNTEER_PAGES[volunteerPage].articleUrl} target="_blank" rel="noreferrer">
                            Read the full story on {VOLUNTEER_PAGES[volunteerPage].articleSource} <ArrowRight size={15} />
                          </a>
                        ) : null}
                        <small>
                          {VOLUNTEER_PAGES[volunteerPage].art === 'logo'
                            ? 'Our mark · Azalea Initiative'
                            : VOLUNTEER_PAGES[volunteerPage].image
                              ? 'From our field notes'
                              : 'Field note from our volunteer journal'}
                        </small>
                      </div>
                    </article>
                    {VOLUNTEER_PAGES[volunteerPage].art === 'logo' && VOLUNTEER_PAGES[volunteerPage].image ? (
                      <div className="sketch-page logo-page">
                        <img
                          className="logo-direct"
                          src={VOLUNTEER_PAGES[volunteerPage].image}
                          alt={VOLUNTEER_PAGES[volunteerPage].caption || 'Azalea Initiative logo'}
                        />
                      </div>
                    ) : VOLUNTEER_PAGES[volunteerPage].image ? (
                      <div className={`sketch-page illustrated-page press-page${VOLUNTEER_PAGES[volunteerPage].art === 'press' ? '' : ' photo-page'}`}>
                        <div className="page-tape"></div>
                        <figure className="press-clipping">
                          <img src={VOLUNTEER_PAGES[volunteerPage].image} alt={VOLUNTEER_PAGES[volunteerPage].caption || VOLUNTEER_PAGES[volunteerPage].title} />
                          <figcaption>
                            <span>{VOLUNTEER_PAGES[volunteerPage].art === 'press' ? '互傳媒 · July 2, 2025' : 'Our volunteers'}</span>
                            {VOLUNTEER_PAGES[volunteerPage].caption}
                          </figcaption>
                        </figure>
                      </div>
                    ) : (
                      <div className={`sketch-page illustrated-page ${VOLUNTEER_PAGES[volunteerPage].art}`} aria-hidden="true">
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
                      <span className="hand-label">Join the team</span>
                      <h3>Become an Azalea volunteer.</h3>
                      <p>Tell us a little about yourself and how you’d like to contribute. Students under 18 will need parent or guardian approval before participating. Applications are saved for Azalea staff and opened as an email to {`celine.zhang@aloft9.com`}.</p>
                      <div className="join-doodle" aria-hidden="true"><Flower2 /><span>you could be<br />on this page!</span></div>
                    </article>
                    <div className="sketch-page application-page">
                      {applicationSent ? (
                        <div className="application-success">
                          <span><Check /></span>
                          <div>
                            <h3>Thanks for raising your hand.</h3>
                            <p>Your application was saved for Azalea staff. If your email app opened, please send that message to finish notifying the team.</p>
                          </div>
                          <button className="text-button" onClick={() => setApplicationSent(false)}>Return to form</button>
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
                              alert(error instanceof Error ? error.message : 'Could not submit your application. Please try again.')
                            }
                          }}
                        >
                          <label>First name<input required name="firstName" autoComplete="given-name" /></label>
                          <label>Email<input required type="email" name="email" autoComplete="email" /></label>
                          <label>Current stage<select required name="stage" defaultValue=""><option value="" disabled>Select one</option><option>High school student</option><option>College student</option><option>Community member</option></select></label>
                          <label>How would you like to help?<select required name="interest" defaultValue=""><option value="" disabled>Select one</option><option>Fundraising events</option><option>Art and messages</option><option>Community outreach</option><option>Translation</option><option>Website and media</option></select></label>
                          <label className="wide">Why are you interested?<textarea required name="motivation" maxLength={600} /></label>
                          <button className="button primary" type="submit">Start my application <ArrowRight size={17} /></button>
                        </form>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="book-controls">
              <button disabled={volunteerPage === 0} onClick={() => turnVolunteerPage(Math.max(0, volunteerPage - 1))}>← Previous page</button>
              <span>{volunteerPage + 1} / {VOLUNTEER_PAGES.length + 1}</span>
              <button disabled={volunteerPage === VOLUNTEER_PAGES.length} onClick={() => turnVolunteerPage(Math.min(VOLUNTEER_PAGES.length, volunteerPage + 1))}>Next page →</button>
            </div>
          </div>
        </section>

        <section className="guidelines-section" id="community-guidelines">
          <div><ShieldCheck /><span className="eyebrow">Community guidelines</span><h2>Protect the person.<br />Celebrate the art.</h2></div>
          <div className="guideline-list">
            <p><strong>01</strong><span><b>Lead with dignity.</b> Speak to artists as peers and avoid pitying, infantilizing, or diagnostic language.</span></p>
            <p><strong>02</strong><span><b>Protect privacy.</b> Never request or post personal contact, medical, school, or precise location information.</span></p>
            <p><strong>03</strong><span><b>Create with permission.</b> Only color, redraw, download, or share when the artist has enabled that option.</span></p>
            <p><strong>04</strong><span><b>Keep it safe.</b> No harassment, hate, sexual content, exploitation, commercial reuse, or private contact requests.</span></p>
          </div>
        </section>

        <section className="current-mission-section" id="current-mission">
          <div className="mission-intro">
            <span className="eyebrow">Pinned to our board</span>
            <h2>Our current<br /><em>mission.</em></h2>
            <p>We’re preparing a Winter 2026 trip so students can support staff and residents of Hysiang Yuan Disabled Care Facility.</p>
          </div>
          <div className="bulletin-board">
            <span className="pushpin pin-one"></span>
            <span className="pushpin pin-two"></span>
            <span className="tape tape-one"></span>
            <span className="tape tape-two"></span>
            <article className="mission-note">
              <span className="hand-label">Winter 2026</span>
              <h3>Back to Taiwan!</h3>
            </article>
            <div className="mission-postcard" aria-hidden="true">
              <div className="postcard-sky"><span>✿</span><span>✿</span><span>✿</span></div>
              <p>See you soon, Taiwan!</p>
              <small>Bay Area → Taiwan</small>
            </div>
            <div className="fund-card">
              <div className="fund-top">
                <span>Planned campaign goal</span>
                <strong className="fund-goal">$10,000</strong>
                <p className="fund-purpose">Travel, lodging, and on-site support for high school volunteers serving with Hysiang Yuan.</p>
              </div>
              <aside className="fund-status-note" aria-label="Fundraising status">
                <p className="fund-status-title">Fundraising is not open yet</p>
                <p>We’re still setting up a verified way to accept gifts. When the campaign launches, a donate button will appear here.</p>
              </aside>
            </div>
          </div>
        </section>

        <section className="donation-section" id="donate">
          <div className="donation-heading">
            <span className="eyebrow">Year-round support</span>
            <h2>Fuel the work<br /><em>between missions.</em></h2>
            <p>One day, general gifts will help charities, visibility events, and student volunteers keep showing up.</p>
          </div>
          <div className="giving-grid">
            <article><span><HandHeart /></span><h3>Charitable giving</h3><p>Support carefully selected organizations serving people with disabilities.</p></article>
            <article><span><Megaphone /></span><h3>Visibility events</h3><p>Host educational, creative, and community events that build understanding.</p></article>
            <article><span><Users /></span><h3>Volunteer programs</h3><p>Fund art materials, translations, outreach, and accessible participation.</p></article>
          </div>
          <div className="overall-giving-card">
            <div>
              <span className="eyebrow">The Azalea General Fund</span>
              <h3>Give where it can help most.</h3>
              <p>We’ll publish how funds are allocated and share regular impact updates.</p>
            </div>
            <aside className="fund-status-note" aria-label="Donation status">
              <p className="fund-status-title">We are not accepting donations right now</p>
              <p>No payment link is live on this site yet. Please create art, volunteer, or check back when giving opens.</p>
              <a className="button ghost small" href="?page=draw">Create a drawing instead</a>
            </aside>
          </div>
        </section>
        <StatusTracker initialCode={new URLSearchParams(window.location.search).get('code') || ''} />
        <StaffWorkspace />

      </main>

      <footer>
        <div className="footer-brand">
          <a className="brand" href="./"><span className="brand-mark"><Flower2 /></span><span>Azalea <em>Initiative</em></span></a>
          <p>Young people growing a more understanding world.</p>
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
          <div><strong>Explore</strong><a href="./#mission">Our mission</a><a href="?page=updates">Caretaker updates</a><a href="./#current-mission">Current mission</a></div>
          <div><strong>Get involved</strong><a href="?page=draw">Create art</a><a href="?page=volunteer">Apply to volunteer</a><a href="./#donate">Donate to the cause</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Azalea Initiative</span><span>Made with care in the Bay Area</span></div>
      </footer>
    </div>
  )
}

export default App
