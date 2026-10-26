import { useEffect, useRef, useState, type PointerEvent } from 'react'
import {
  ArrowDown,
  ArrowRight,
  Brush,
  CalendarDays,
  Check,
  Download,
  Eraser,
  Flower2,
  HandHeart,
  Heart,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  Plane,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import './App.css'

const COLORS = ['#29362e', '#e77560', '#e7a6c4', '#e7a833', '#6f8f78', '#7694b7', '#ffffff']

const VOLUNTEER_PAGES = [
  {
    tab: 'Awareness fair',
    kicker: 'Community visibility',
    title: 'Bay Area Awareness Fair',
    description: 'A concept page for sharing an accessible community event with art stations, disability education, and conversations led by people with lived experience.',
    details: ['Public education', 'Creative activities', 'Local partnerships'],
    art: 'fair',
  },
  {
    tab: 'Art drive',
    kicker: 'Creative exchange',
    title: 'Community Art Supply Drive',
    description: 'A sample recap for collecting new, accessible art materials and preparing creative kits for partner programs and local events.',
    details: ['Supply collection', 'Volunteer packing', 'Partner delivery'],
    art: 'garden',
  },
  {
    tab: 'Fundraiser',
    kicker: 'Community powered',
    title: 'Neighborhood Fundraiser',
    description: 'A template for documenting the goal, community partners, amount raised, transparent allocation, and lessons from a local fundraiser.',
    details: ['Fundraising goal', 'Impact breakdown', 'Thank-you notes'],
    art: 'fields',
  },
  {
    tab: 'Service trip',
    kicker: 'Volunteer field notes',
    title: 'Taiwan Service Week',
    description: 'A place for approved reflections, activity highlights, and practical advice from volunteers after an in-person service program.',
    details: ['Daily reflections', 'Consent-approved photos', 'What we learned'],
    art: 'journey',
  },
] as const

function DrawingStudio({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPoint = useRef({ x: 0, y: 0 })
  const [color, setColor] = useState(COLORS[0])
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    context.fillStyle = '#fffdf7'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const startDrawing = (event: PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true
    lastPoint.current = point(event)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const canvas = canvasRef.current!
    const context = canvas.getContext('2d')!
    const next = point(event)
    context.beginPath()
    context.moveTo(lastPoint.current.x, lastPoint.current.y)
    context.lineTo(next.x, next.y)
    context.strokeStyle = color
    context.lineWidth = color === '#ffffff' ? 28 : 7
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.stroke()
    lastPoint.current = next
  }

  const clear = () => {
    const canvas = canvasRef.current!
    const context = canvas.getContext('2d')!
    context.fillStyle = '#fffdf7'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const download = () => {
    const link = document.createElement('a')
    link.download = 'azalea-artwork.png'
    link.href = canvasRef.current!.toDataURL()
    link.click()
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="studio-title">
      <div className="studio">
        <div className="studio-header">
          <div>
            <span className="eyebrow">A small act of joy</span>
            <h2 id="studio-title">Create something kind</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close drawing studio"><X /></button>
        </div>
        {sent ? (
          <div className="success-state">
            <span className="success-icon"><Check /></span>
            <h3>Your artwork is ready for its journey.</h3>
            <p>In the full program, a volunteer will review it before securely sharing it with our partner facility.</p>
            <button className="button primary" onClick={onClose}>Back to the garden</button>
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              width={900}
              height={520}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={() => { drawing.current = false }}
              onPointerCancel={() => { drawing.current = false }}
              aria-label="Drawing canvas"
            />
            <div className="studio-toolbar">
              <div className="colors" aria-label="Drawing colors">
                {COLORS.slice(0, -1).map((item) => (
                  <button
                    key={item}
                    className={`color-swatch ${color === item ? 'active' : ''}`}
                    style={{ backgroundColor: item }}
                    onClick={() => setColor(item)}
                    aria-label={`Select color ${item}`}
                  />
                ))}
                <button className={`eraser ${color === '#ffffff' ? 'active' : ''}`} onClick={() => setColor('#ffffff')} aria-label="Eraser">
                  <Eraser size={18} />
                </button>
                <button className="text-button" onClick={clear}>Clear</button>
              </div>
              <div className="toolbar-actions">
                <button className="button ghost small" onClick={download}><Download size={17} /> Save</button>
                <button className="button primary small" onClick={() => setSent(true)}>Share kindness <ArrowRight size={17} /></button>
              </div>
            </div>
            <p className="privacy-note">Prototype only — artwork stays on your device unless you download it.</p>
          </>
        )}
      </div>
    </div>
  )
}

function App() {
  const [studioOpen, setStudioOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [messageSent, setMessageSent] = useState(false)
  const [applicationSent, setApplicationSent] = useState(false)
  const [volunteerPage, setVolunteerPage] = useState(0)
  const requestedPage = new URLSearchParams(window.location.search).get('page')
  const page = requestedPage === 'updates' || requestedPage === 'volunteer' ? requestedPage : 'home'

  return (
    <div className={`site-shell page-${page}`}>
      <header className="site-header">
        <a className="brand" href="./" aria-label="Azalea Initiative home">
          <span className="brand-mark"><Flower2 /></span>
          <span>Azalea <em>Initiative</em></span>
        </a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"><Menu /></button>
        <nav className={menuOpen ? 'open' : ''} onClick={() => setMenuOpen(false)}>
          <div className="nav-home-group" aria-label="Homepage sections">
            <a href="./#mission">Our mission</a>
            <button className="nav-link-button" onClick={() => setStudioOpen(true)}>Send a Picture!</button>
            <a href="./#current-mission">Current Mission</a>
          </div>
          <a className="nav-cta" href="./#donate">Donate to the Cause <ArrowRight size={16} /></a>
          <a href="?page=updates#updates" aria-current={page === 'updates' ? 'page' : undefined}>Updates</a>
          <a href="?page=volunteer#volunteers" aria-current={page === 'volunteer' ? 'page' : undefined}>Volunteer</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={14} /> Kindness across the Globe</span>
            <h1>Every person<br />deserves to feel<br /><em>seen.</em></h1>
            <p>We’re a student-led community connecting Bay Area neighbors with people with disabilities and their caregivers in Taiwan—one drawing, message, and shared moment at a time.</p>
            <div className="hero-actions">
              <button className="button primary" onClick={() => setStudioOpen(true)}>Create a drawing <Brush size={18} /></button>
              <a className="button text-link" href="#mission">Discover our story <ArrowDown size={18} /></a>
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

        <section className="connect-section" id="connect">
          <div className="section-heading">
            <span className="eyebrow">Choose your way to connect</span>
            <h2>Send a little warmth<br /><em>across the world.</em></h2>
          </div>
          <div className="connection-grid">
            <button className="connection-card coral" onClick={() => setStudioOpen(true)}>
              <span className="card-number">01</span>
              <span className="card-icon"><Brush /></span>
              <span>
                <strong>Draw a picture</strong>
                <small>Create art to color, display, and enjoy.</small>
              </span>
              <ArrowRight className="card-arrow" />
            </button>
            <a className="connection-card blue" href="#message">
              <span className="card-number">02</span>
              <span className="card-icon"><Mail /></span>
              <span>
                <strong>Thank a caregiver</strong>
                <small>Send encouragement to the team in Taiwan.</small>
              </span>
              <ArrowRight className="card-arrow" />
            </a>
            <a className="connection-card gold" href="#gallery">
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
            <p>A future consent-first gallery where every creation becomes a digital flower—never ranked, sold, or reduced to a prize.</p>
          </div>
          <div className="gallery-row" aria-label="Sample artwork placeholders">
            <article className="art-card art-one"><div><span>✿</span><span>☀</span></div><p>Sunshine Garden</p><small>Community artwork • sample</small></article>
            <article className="art-card art-two"><div><span>魚</span><span>〰</span></div><p>Blue Fish Day</p><small>Community artwork • sample</small></article>
            <article className="art-card art-three"><div><span>⌂</span><span>♡</span></div><p>Home Together</p><small>Community artwork • sample</small></article>
          </div>
          <p className="gallery-caption"><Sparkles size={15} /> Collect kindness, not rarity. Visit and contribute to help the community garden grow.</p>
        </section>

        <section className="updates-section" id="updates">
          <div className="updates-heading">
            <span className="eyebrow">From our partner caretakers</span>
            <h2>Notes from<br /><em>day to day.</em></h2>
            <p>A future space for trained facility caretakers to share consent-approved activities, celebrations, and community updates directly with supporters.</p>
            <button className="button ghost" onClick={() => alert('The invitation-only caretaker workspace will be added with the moderated community platform.')}>Caretaker workspace coming soon <ArrowRight size={17} /></button>
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
              <p className="eyebrow">Our community promise</p>
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
        </section>

        <section className="volunteer-section" id="volunteers">
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
                  onClick={() => setVolunteerPage(index)}
                >
                  <span>0{index + 1}</span>{item.tab}
                </button>
              ))}
              <button
                className="join-bookmark"
                role="tab"
                aria-selected={volunteerPage === VOLUNTEER_PAGES.length}
                onClick={() => setVolunteerPage(VOLUNTEER_PAGES.length)}
              >
                <span>05</span>Join the team
              </button>
            </div>
            <div className="book-cover">
              <div className="book-spine"><Flower2 /><span>AZALEA<br />FIELD NOTES</span></div>
              <div className="book-paper-edge"></div>
              <div className="book-spread" key={volunteerPage}>
                {volunteerPage < VOLUNTEER_PAGES.length ? (
                  <>
                    <article className="sketch-page story-page">
                      <span className="page-number">0{volunteerPage + 1}</span>
                      <span className="hand-label">{VOLUNTEER_PAGES[volunteerPage].kicker}</span>
                      <h3>{VOLUNTEER_PAGES[volunteerPage].title}</h3>
                      <p>{VOLUNTEER_PAGES[volunteerPage].description}</p>
                      <ul>
                        {VOLUNTEER_PAGES[volunteerPage].details.map((detail) => <li key={detail}>{detail}</li>)}
                      </ul>
                      <small>Concept activity page • replace with verified event details</small>
                    </article>
                    <div className={`sketch-page illustrated-page ${VOLUNTEER_PAGES[volunteerPage].art}`} aria-hidden="true">
                      <div className="page-tape"></div>
                      <div className="activity-illustration">
                        <span className="shape s1"></span><span className="shape s2"></span><span className="shape s3"></span>
                        <Flower2 />
                      </div>
                      <p>make • learn • connect</p>
                    </div>
                  </>
                ) : (
                  <>
                    <article className="sketch-page join-page">
                      <span className="page-number">05</span>
                      <span className="hand-label">Join the team</span>
                      <h3>Become an Azalea volunteer.</h3>
                      <p>Tell us a little about yourself and how you’d like to contribute. Students under 18 will need parent or guardian approval before participating.</p>
                      <div className="join-doodle" aria-hidden="true"><Flower2 /><span>you could be<br />on this page!</span></div>
                    </article>
                    <div className="sketch-page application-page">
                      {applicationSent ? (
                        <div className="application-success">
                          <span><Check /></span>
                          <div><h3>Thanks for raising your hand.</h3><p>This prototype has not sent your information. The secure application workflow will be connected before launch.</p></div>
                          <button className="text-button" onClick={() => setApplicationSent(false)}>Return to form</button>
                        </div>
                      ) : (
                        <form onSubmit={(event) => { event.preventDefault(); setApplicationSent(true) }}>
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
              <button disabled={volunteerPage === 0} onClick={() => setVolunteerPage((page) => Math.max(0, page - 1))}>← Previous page</button>
              <span>{volunteerPage + 1} / {VOLUNTEER_PAGES.length + 1}</span>
              <button disabled={volunteerPage === VOLUNTEER_PAGES.length} onClick={() => setVolunteerPage((page) => Math.min(VOLUNTEER_PAGES.length, page + 1))}>Next page →</button>
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
            <p>Our focus changes as community needs change. Right now, we’re raising funds to continue a longstanding winter service tradition in Taiwan.</p>
          </div>
          <div className="bulletin-board">
            <span className="pushpin pin-one"></span>
            <span className="pushpin pin-two"></span>
            <span className="tape tape-one"></span>
            <span className="tape tape-two"></span>
            <article className="mission-note">
              <span className="hand-label">Winter 2026</span>
              <h3>Back to Kaohsiung</h3>
              <p>We hope to return to Christian Mountain Children’s Home to volunteer in person and continue a relationship built over years of service.</p>
              <div className="route">
                <span><MapPin size={17} /> Bay Area</span>
                <div><Plane size={19} /></div>
                <span><MapPin size={17} /> Kaohsiung</span>
              </div>
            </article>
            <div className="mission-postcard" aria-hidden="true">
              <div className="postcard-sky"><span>✿</span><span>✿</span><span>✿</span></div>
              <p>See you soon, Taiwan!</p>
              <small>34.99° N → 22.92° N</small>
            </div>
            <div className="fund-card">
              <div className="fund-top">
                <span>Current campaign</span>
                <strong>Funding page coming soon</strong>
              </div>
              <div className="progress"><span></span></div>
              <div className="fund-stats">
                <span><strong>Our goal</strong><small>Travel, lodging & supplies</small></span>
                <span><strong>100%</strong><small>Transparent updates</small></span>
              </div>
              <button className="button cream" onClick={() => alert('A verified campaign link will be added once the fundraising setup is ready.')}>Follow this mission <ArrowRight size={17} /></button>
              <small className="fund-disclaimer">Campaign donations are not yet being accepted on this prototype.</small>
            </div>
          </div>
        </section>

        <section className="donation-section" id="donate">
          <div className="donation-heading">
            <span className="eyebrow">Year-round support</span>
            <h2>Fuel the work<br /><em>between missions.</em></h2>
            <p>General donations help us support aligned charities, organize disability-visibility events, and give student volunteers the tools to keep showing up.</p>
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
            <div>
              <button className="button primary" onClick={() => alert('A verified general donation link will be added once the organization’s fiscal setup is ready.')}>Donation page coming soon <ArrowRight size={17} /></button>
              <small>General donations are not yet being accepted on this prototype.</small>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <a className="brand" href="./"><span className="brand-mark"><Flower2 /></span><span>Azalea <em>Initiative</em></span></a>
          <p>Young people growing a more understanding world.</p>
        </div>
        <div className="footer-links">
          <div><strong>Explore</strong><a href="./#mission">Our mission</a><a href="?page=updates#updates">Caretaker updates</a><a href="./#current-mission">Current mission</a></div>
          <div><strong>Get involved</strong><button onClick={() => setStudioOpen(true)}>Create art</button><a href="?page=volunteer#volunteer-application">Apply to volunteer</a><a href="./#donate">Donate to the cause</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Azalea Initiative</span><span>Made with care in the Bay Area</span></div>
      </footer>
      {studioOpen && <DrawingStudio onClose={() => setStudioOpen(false)} />}
    </div>
  )
}

export default App
