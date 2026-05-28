import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function sendLink(e) {
    e.preventDefault()

    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      if (error) throw error

      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h1>Forklift Training</h1>
      <p>Sign in with your email to continue.</p>

      {sent ? (
        <div className="notice ok">
          Magic link sent to <b>{email}</b>. Open your email to sign in.
        </div>
      ) : (
        <form onSubmit={sendLink} className="stack">
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </label>

          <button disabled={loading}>
            {loading ? 'Sending…' : 'Send magic link'}
          </button>

          {error && <div className="notice err">{error}</div>}
        </form>
      )}
    </div>
  )
}
