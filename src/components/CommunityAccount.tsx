import { useEffect, useState, type FormEvent } from 'react'
import { LogIn, LogOut, UserPlus } from 'lucide-react'
import {
  getSessionUser,
  loginCommunity,
  loginStaff,
  logout,
  registerCommunity,
  subscribeStore,
} from '../platform/store'
import { useLanguage } from '../i18n/LanguageContext'

function CommunityAccount() {
  const { t } = useLanguage()
  const [, setTick] = useState(0)
  const user = getSessionUser()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => subscribeStore(() => setTick((value) => value + 1)), [])

  const community = user?.kind === 'community' ? user : null

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const id = username.trim()
    try {
      if (mode === 'register') {
        if (id.includes('@')) {
          throw new Error('Community accounts use a username, not an email. Pick a short username instead.')
        }
        await registerCommunity(id, password, displayName || id)
      } else if (id.includes('@')) {
        await loginStaff(id, password)
      } else {
        await loginCommunity(id, password)
      }
      setPassword('')
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }

  if (community) {
    return (
      <div className="community-account signed-in">
        <span className="community-user">{t('auth.hi', { name: community.displayName })}</span>
        <button type="button" className="button ghost small" onClick={() => void logout()}>
          <LogOut size={14} /> {t('auth.signOut')}
        </button>
      </div>
    )
  }

  if (user?.kind === 'staff') {
    return (
      <div className="community-account signed-in">
        <span className="community-user">{t('auth.staffLabel', { name: user.displayName })}</span>
        <a className="button ghost small" href="?page=staff">{t('auth.openStaff')}</a>
        <button type="button" className="button ghost small" onClick={() => void logout()}>
          <LogOut size={14} /> {t('auth.signOut')}
        </button>
      </div>
    )
  }

  return (
    <div className="community-account">
      <button type="button" className="button ghost small" onClick={() => setOpen(!open)}>
        <LogIn size={14} /> {t('auth.signIn')}
      </button>
      {open && (
        <form className="community-auth-card" onSubmit={onSubmit}>
          <p className="eyebrow">{mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}</p>
          <p className="community-auth-help">
            {mode === 'login' ? t('auth.loginHelp') : t('auth.registerHelp')}
          </p>
          <label>
            {mode === 'login' ? t('auth.usernameOrEmail') : t('auth.username')}
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              minLength={3}
              maxLength={mode === 'login' ? 64 : 24}
              autoComplete={mode === 'login' ? 'username' : 'username'}
              placeholder={mode === 'login' ? 'username or email' : 'choose a username'}
            />
          </label>
          {mode === 'register' && (
            <label>
              {t('auth.displayName')}
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={40} placeholder={t('auth.optional')} />
            </label>
          )}
          <label>
            {t('auth.password')}
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button primary small" type="submit" disabled={busy}>
            {mode === 'login' ? <><LogIn size={14} /> {t('auth.signIn')}</> : <><UserPlus size={14} /> {t('auth.create')}</>}
          </button>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
          >
            {mode === 'login' ? t('auth.needAccount') : t('auth.haveAccount')}
          </button>
        </form>
      )}
    </div>
  )
}

export default CommunityAccount
