import { useEffect, useState, type FormEvent } from 'react'
import { LogIn, LogOut, UserPlus } from 'lucide-react'
import { getSessionUser, loginCommunity, logout, registerCommunity, subscribeStore } from '../platform/store'

function CommunityAccount() {
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
    try {
      if (mode === 'register') {
        await registerCommunity(username, password, displayName || username)
      } else {
        await loginCommunity(username, password)
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
        <span className="community-user">Hi, {community.displayName}</span>
        <button type="button" className="button ghost small" onClick={() => void logout()}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    )
  }

  if (user?.kind === 'staff') {
    return (
      <div className="community-account signed-in">
        <span className="community-user">Staff: {user.displayName}</span>
      </div>
    )
  }

  return (
    <div className="community-account">
      <button type="button" className="button ghost small" onClick={() => setOpen(!open)}>
        <LogIn size={14} /> Save progress
      </button>
      {open && (
        <form className="community-auth-card" onSubmit={onSubmit}>
          <p className="eyebrow">{mode === 'login' ? 'Sign in to keep your drawings' : 'Create a free account'}</p>
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={24} />
          </label>
          {mode === 'register' && (
            <label>
              Display name
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={40} placeholder="Optional" />
            </label>
          )}
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button primary small" type="submit" disabled={busy}>
            {mode === 'login' ? <><LogIn size={14} /> Sign in</> : <><UserPlus size={14} /> Create account</>}
          </button>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
          >
            {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
          </button>
        </form>
      )}
    </div>
  )
}

export default CommunityAccount
