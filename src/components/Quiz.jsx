import { useMemo, useState } from 'react'
import { TRAINING_RULES } from '../data/trainingRules'
import { areAllNonQuizModulesComplete } from '../data/course'
import { recordQuizAttempt, upsertCompletion } from '../lib/db'

const QUESTIONS = [
  {
    id: 'q1',
    text: 'Seatbelts should be worn when operating a forklift.',
    correct: 'true',
  },
  {
    id: 'q2',
    text: 'You may exceed rated capacity if the load feels stable.',
    correct: 'false',
  },
  {
    id: 'q3',
    text: 'A pre-use inspection should be completed before operation.',
    correct: 'true',
  },
  {
    id: 'q4',
    text: 'Travel with the load as low as possible.',
    correct: 'true',
  },
  {
    id: 'q5',
    text: 'It is okay to carry passengers on a forklift if they hold on tightly.',
    correct: 'false',
  },
]

export default function Quiz({
  userId,
  completedModules,
  onCompletion,
  onAttempt,
}) {
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(QUESTIONS.map((q) => [q.id, '']))
  )
  const [ackChecked, setAckChecked] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const quizUnlocked = useMemo(() => {
    if (!TRAINING_RULES.REQUIRE_ALL_MODULES_BEFORE_QUIZ) return true
    return areAllNonQuizModulesComplete(completedModules)
  }, [completedModules])

  function grade() {
    const total = QUESTIONS.length
    const correct = QUESTIONS.filter((q) => answers[q.id] === q.correct).length
    const scorePercent = Math.round((correct / total) * 100)
    const passed = scorePercent >= TRAINING_RULES.PASSING_SCORE_PERCENT

    return {
      total,
      correct,
      scorePercent,
      passed,
    }
  }

  async function submit() {
    setError(null)
    setSaving(true)

    try {
      const graded = grade()

      const attempt = {
        score: graded.scorePercent,
        totalQuestions: graded.total,
        correct: graded.correct,
        passed: graded.passed,
        attemptedAt: new Date().toISOString(),
      }

      await recordQuizAttempt({
        userId,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        passed: attempt.passed,
      })

      setResult(attempt)
      onAttempt?.(attempt)

      if (attempt.passed && ackChecked) {
        const completion = await upsertCompletion({
          userId,
          quizScore: attempt.score,
        })

        onCompletion?.(completion)
      }
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <h2>Final Quiz</h2>

      {!quizUnlocked && (
        <div className="notice warn">
          <b>Quiz Locked</b>
          <div>Complete all training modules before taking the final quiz.</div>
        </div>
      )}

      <div
        style={{
          opacity: quizUnlocked ? 1 : 0.5,
          pointerEvents: quizUnlocked ? 'auto' : 'none',
        }}
      >
        {QUESTIONS.map((q) => (
          <div key={q.id} className="question">
            <div className="qtext">{q.text}</div>

            <label className="radio">
              <input
                type="radio"
                name={q.id}
                value="true"
                checked={answers[q.id] === 'true'}
                onChange={(e) =>
                  setAnswers((current) => ({
                    ...current,
                    [q.id]: e.target.value,
                  }))
                }
              />
              True
            </label>

            <label className="radio">
              <input
                type="radio"
                name={q.id}
                value="false"
                checked={answers[q.id] === 'false'}
                onChange={(e) =>
                  setAnswers((current) => ({
                    ...current,
                    [q.id]: e.target.value,
                  }))
                }
              />
              False
            </label>
          </div>
        ))}

        <label className="checkbox-label ack">
          <input
            type="checkbox"
            checked={ackChecked}
            onChange={(e) => setAckChecked(e.target.checked)}
          />
          I acknowledge I completed the formal training content and understand
          that hands-on evaluation is still required.
        </label>

        <button onClick={submit} disabled={saving}>
          {saving ? 'Submitting…' : 'Submit quiz'}
        </button>

        {result && (
          <div className="notice" style={{ marginTop: 12 }}>
            Score: <b>{result.score}%</b> ({result.correct}/
            {result.totalQuestions}) —{' '}
            {result.passed ? 'Passed' : 'Not passed yet'}

            {result.passed && !ackChecked && (
              <div style={{ marginTop: 6 }}>
                You passed. Check the acknowledgment box to complete formal
                training.
              </div>
            )}
          </div>
        )}

        {error && <div className="notice err">{error}</div>}
      </div>
    </div>
  )
}
