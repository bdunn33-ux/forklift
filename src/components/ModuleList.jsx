export default function ModuleList({ modules, completedModules, onComplete }) {
  return (
    <div className="card">
      <h2>Modules</h2>

      <ul className="list">
        {modules
          .filter((m) => !m.isQuiz)
          .map((m) => {
            const done = completedModules.includes(m.id)

            return (
              <li key={m.id} className="row">
                <span>{done ? '✅' : '⬜️'} {m.title}</span>

                <button disabled={done} onClick={() => onComplete(m.id)}>
                  {done ? 'Completed' : 'Mark complete'}
                </button>
              </li>
            )
          })}
      </ul>
    </div>
  )
}
