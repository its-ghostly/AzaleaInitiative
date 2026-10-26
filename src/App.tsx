import { useEffect, useRef, useState, type PointerEvent } from 'react'
import {
  ArrowDown,
  ArrowRight,
  Brush,
  Check,
  Download,
  Eraser,
  Flower2,
  Heart,
  Mail,
  MapPin,
  Menu,
  Plane,
  Sparkles,
  X,
} from 'lucide-react'
import './App.css'

const COLORS = ['#29362e', '#e77560', '#e7a833', '#6f8f78', '#7694b7', '#ffffff']

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

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Azalea Initiative home">
          <span className="brand-mark"><Flower2 /></span>
          <span>Azalea <em>Initiative</em></span>
        </a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"><Menu /></button>
        <nav className={menuOpen ? 'open' : ''} onClick={() => setMenuOpen(false)}>
          <a href="#mission">Our mission</a>
          <a href="#connect">Connect</a>
          <a href="#journey">The journey</a>
          <a className="nav-cta" href="#support">Support us <ArrowRight size={16} /></a>
        </nav>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={14} /> Kindness across the Pacific</span>
            <h1>Every person<br />deserves to feel<br /><em>seen.</em></h1>
            <p>We’re a student-led community connecting Bay Area neighbors with people with disabilities and their caregivers in Taiwan—one drawing, message, and shared moment at a time.</p>
            <div className="hero-actions">
              <button className="button primary" onClick={() => setStudioOpen(true)}>Create a drawing <Brush size={18} /></button>
              <a className="button text-link" href="#mission">Discover our story <ArrowDown size={18} /></a>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="sun"></div>
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

        <section className="journey-section" id="journey">
          <div className="journey-copy">
            <span className="eyebrow light">Our next chapter</span>
            <h2>Help us show up<br /><em>in person.</em></h2>
            <p>This winter, our student volunteers hope to return to Christian Mountain Children’s Home in Kaohsiung—continuing a relationship built over years of service.</p>
            <div className="route">
              <span><MapPin size={17} /> Bay Area</span>
              <div><Plane size={19} /></div>
              <span><MapPin size={17} /> Kaohsiung, Taiwan</span>
            </div>
          </div>
          <div className="fund-card" id="support">
            <div className="fund-top">
              <span>Winter service trip</span>
              <strong>Funding page coming soon</strong>
            </div>
            <div className="progress"><span></span></div>
            <div className="fund-stats">
              <span><strong>Our goal</strong><small>Travel, lodging & supplies</small></span>
              <span><strong>100%</strong><small>Transparent updates</small></span>
            </div>
            <button className="button cream" onClick={() => alert('A verified donation link will be added once the campaign and fiscal setup are ready.')}>Get campaign updates <ArrowRight size={17} /></button>
            <small className="fund-disclaimer">Donations are not yet being accepted on this prototype.</small>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <a className="brand" href="#top"><span className="brand-mark"><Flower2 /></span><span>Azalea <em>Initiative</em></span></a>
          <p>Young people growing a more understanding world.</p>
        </div>
        <div className="footer-links">
          <div><strong>Explore</strong><a href="#mission">Our mission</a><a href="#connect">Connect</a><a href="#journey">The journey</a></div>
          <div><strong>Get involved</strong><button onClick={() => setStudioOpen(true)}>Create art</button><a href="#message">Write a note</a><a href="#support">Support us</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Azalea Initiative</span><span>Made with care in the Bay Area</span></div>
      </footer>
      {studioOpen && <DrawingStudio onClose={() => setStudioOpen(false)} />}
    </>
  )
}

export default App
