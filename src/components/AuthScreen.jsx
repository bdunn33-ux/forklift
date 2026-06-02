import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthScreen() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  const isSignup = mode === 'signup'

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        })
        if (error) throw error
        // With email confirmation disabled in Supabase, signUp logs the user
        // in immediately and onAuthStateChange takes over from here.
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })
        if (error) throw error
      }
    } catch (err) {
      setError(friendlyError(err?.message))
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setError(null)
    setInfo(null)
    setMode(isSignup ? 'signin' : 'signup')
  }

  return (
    <div className="card">
      <h1>Forklift Training</h1>
      <p>
        {isSignup
          ? 'Create an account to start your training.'
          : 'Sign in to continue your training.'}
      </p>

      <form onSubmit={submit} className="stack">
        <label>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
          />
        </label>

        <button disabled={loading}>
          {loading
            ? 'Please wait…'
            : isSignup
              ? 'Create account'
              : 'Sign in'}
        </button>

        {error && <div className="notice err">{error}</div>}
        {info && <div className="notice ok">{info}</div>}
      </form>

      <p className="muted" style={{ marginTop: 12 }}>
        {isSignup ? 'Already have an account?' : 'First time here?'}{' '}
        <button type="button" className="linklike" onClick={switchMode}>
          {isSignup ? 'Sign in' : 'Create one'}
        </button>
      </p>
    </div>
  )
}

function friendlyError(message) {
  if (!message) return 'Something went wrong. Please try again.'
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) {
    return 'Incorrect email or password.'
  }
  if (m.includes('already registered') || m.includes('already exists')) {
    return 'An account with this email already exists. Try signing in instead.'
  }
  if (m.includes('email not confirmed')) {
    return 'This account still needs email confirmation. Ask your admin to disable email confirmation in Supabase, or confirm via the link sent to your email.'
  }
  return message
}
