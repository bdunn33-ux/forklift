import { useEffect, useState } from 'react'
import {
  isTrainingAdmin,
  adminResetTraining,
  adminOverrideCompletion,
} from '../lib/adminDb'

export default function AdminPanel() {
  // SECURITY NOTE:
  // UI hiding is for convenience only. Real authorization is enforced by the
  // SECURITY DEFINER RPC functions in the database.

  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [targetUserId, setTargetUserId] = useState('')
  const [wipeAttempts, setWipeAttempts] = useState(false)
  const [quizScore, setQuizScore] = useState(95)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function checkAccess() {
      setChecking(true)

      try {
        const ok = await isTrainingAdmin()
        if (!cancelled) setAllowed(ok)
      } catch {
        if (!cancelled) setAllowed(false)
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    checkAccess()

    return () => {
      cancelled = true
    }
  }, [])

  if (checking) return null
  if (!allowed) return null

  async function handleReset() {
    setError(null)
    setMessage(null)

    if (!targetUserId) {
      setError('Target user_id is required.')
      return
    }

    const confirmText = wipeAttempts
      ? 'Reset training and DELETE all quiz attempts for this user? This cannot be undone.'
      : 'Reset training for this user? Completion will be removed, but quiz attempts will be preserved.'

    if (!window.confirm(confirmText)) return

    setBusy(true)

    try {
      await adminResetTraining({
        targetUserId,
        wipeAttempts,
      })

      setMessage(`Training reset completed. wipeAttempts=${wipeAttempts}`)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  async function handleOverride() {
    setError(null)
    setMessage(null)

    if (!targetUserId) {
      setError('Target user_id is required.')
      return
    }

    const confirmText =
      'Override formal completion for this user? This will mark formal training complete but hands-on evaluation will still be required.'

    if (!window.confirm(confirmText)) return

    setBusy(true)

    try {
      await adminOverrideCompletion({
        targetUserId,
        quizScore: Number.isFinite(Number(quizScore)) ? Number(quizScore) : null,
        passed: true,
        acknowledgmentChecked: true,
      })

      setMessage('Formal completion overridden successfully.')
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card admin-card">
      <h2>Trainer/Admin Tools</h2>

      <p className="muted">Internal use only. Changes apply immediately.</p>

      <div className="notice warn">
        These actions affect user training records immediately. Confirm the
        target user_id before continuing.
      </div>

      <label>
        Target user_id
        <input
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        />
      </label>

      <div className="row wrap">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={wipeAttempts}
            onChange={(e) => setWipeAttempts(e.target.checked)}
          />
          Wipe quiz attempts
        </label>

        <label>
          Quiz score
          <input
            type="number"
            value={quizScore}
            onChange={(e) => setQuizScore(e.target.value)}
          />
        </label>
      </div>

      <div className="row wrap">
        <button onClick={handleReset} disabled={busy}>
          Reset Training
        </button>

        <button onClick={handleOverride} disabled={busy}>
          Override Formal Completion
        </button>
      </div>

      {message && <div className="notice ok">{message}</div>}
      {error && <div className="notice err">{error}</div>}

      <p className="muted">
        Final user status remains:{' '}
        <b>Formal Training Complete — Hands-on evaluation still required</b>
      </p>
    </div>
  )
}
