export default function CompletionPanel({ completion }) {
  const formal = completion?.formal_training_complete === true

  if (!formal) {
    return (
      <div className="card">
        <h3>Completion</h3>
        <p>
          Complete all modules and pass the quiz with acknowledgment to finish
          formal training.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3>Completion</h3>

      <p>
        <b>Formal training:</b> Complete
      </p>

      <p>
        <b>Hands-on evaluation:</b> Required
      </p>

      <p>
        <b>Certification:</b> Pending
      </p>

      <div className="notice ok">
        Formal Training Complete — Hands-on evaluation still required
      </div>
    </div>
  )
}
