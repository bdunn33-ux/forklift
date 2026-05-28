import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

import AuthScreen from '../components/AuthScreen'
import StatusBanner from '../components/StatusBanner'
import ModuleList from '../components/ModuleList'
import Quiz from '../components/Quiz'
import CompletionPanel from '../components/CompletionPanel'
import AdminPanel from '../components/AdminPanel'

import { course, computeCompletionPercent } from '../data/course'
import {
  ensureProfile,
  getOrCreateProgress,
  saveProgress,
  getCompletion,
} from '../lib/db'

export default function App() {
  const { user, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const [progress, setProgress] = useState(null)
  const [completion, setCompletion] = useState(null)
  const [lastQuizAttempt, setLastQuizAttempt] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setProgress(null)
      setCompletion(null)
      setLastQuizAttempt(null)
      setError(null)
      return
    }

    let cancelled = false

    async function loadTrainingData() {
      setLoading(true)
      setError(null)

      try {
        const loadedProfile = await ensureProfile(user)
        const loadedProgress = await getOrCreateProgress(user.id)
        const loadedCompletion = await getCompletion(user.id)

        if (!cancelled) {
          setProfile(loadedProfile)
          setProgress(loadedProgress)
          setCompletion(loadedCompletion)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || String(e))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadTrainingData()

    return () => {
      cancelled = true
    }
  }, [user])

  const completedModules = useMemo(() => {
    return progress?.completed_modules ?? []
  }, [progress])

  const progressPercent = useMemo(() => {
    return progress?.completion_percent ?? computeCompletionPercent(completedModules)
  }, [progress, completedModules])

  async function markComplete(moduleId) {
    if (!user || !progress) return

    setError(null)

    const nextCompletedModules = Array.from(
      new Set([...completedModules, moduleId])
    )

    const nextPercent = computeCompletionPercent(nextCompletedModules)

    setProgress((current) => ({
      ...current,
      completed_modules: nextCompletedModules,
      completion_percent: nextPercent,
    }))

    try {
      const saved = await saveProgress({
        userId: user.id,
        completedModules: nextCompletedModules,
        completionPercent: nextPercent,
      })

      setProgress(saved)
    } catch (e) {
      setError(e.message || String(e))
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (authLoading) {
    return (
      <div className="page">
        <div className="card">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page">
        <AuthScreen />
      </div>
    )
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1 className="title">{course.title}</h1>
          <div className="sub">
            Signed in as <b>{user.email}</b>
            {profile?.role ? (
              <>
                {' '}
                • Role: <b>{profile.role}</b>
              </>
            ) : null}
          </div>
        </div>

        <button onClick={signOut}>Sign out</button>
      </header>

      {error && (
        <div className="notice err">
          <b>Error:</b> {error}
        </div>
      )}

      {loading || !progress ? (
        <div className="card">Loading training data...</div>
      ) : (
        <>
          <StatusBanner
            completion={completion}
            progressPercent={progressPercent}
          />

          <div className="grid">
            <ModuleList
              modules={course.modules}
              completedModules={completedModules}
              onComplete={markComplete}
            />

            <div className="stack">
              <Quiz
                userId={user.id}
                completedModules={completedModules}
                onCompletion={(newCompletion) => setCompletion(newCompletion)}
                onAttempt={(attempt) => setLastQuizAttempt(attempt)}
              />

              <CompletionPanel completion={completion} />
            </div>
          </div>

          {lastQuizAttempt && (
            <div className="card">
              <h3>Last Quiz Attempt</h3>
              <p>
                Score: <b>{lastQuizAttempt.score}%</b> (
                {lastQuizAttempt.correct}/{lastQuizAttempt.totalQuestions}) —{' '}
                {lastQuizAttempt.passed ? 'Passed' : 'Not passed yet'}
              </p>
            </div>
          )}

          <AdminPanel />
        </>
      )}
    </div>
  )
}
