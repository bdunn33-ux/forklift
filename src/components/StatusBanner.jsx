export default function StatusBanner({ completion, progressPercent }) {
  const formal = completion?.formal_training_complete === true
  const practical = completion?.practical_evaluation_required === true

  let text = `In Progress — ${progressPercent}% complete.`
  let cls = 'notice warn'

  if (formal && practical) {
    text = 'Formal Training Complete — Hands-on evaluation still required'
    cls = 'notice ok'
  }

  return (
    <div className={cls}>
      <b>Status:</b> {text}
    </div>
  )
}
