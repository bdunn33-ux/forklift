import { COURSE_ID } from '../lib/schema'

export const course = {
  id: COURSE_ID,
  title: 'Forklift Operator Training (OSHA 1910.178(l))',

  modules: [
    { id: 'intro', title: 'Introduction & Objectives' },
    { id: 'hazards', title: 'Hazards & Controls' },
    { id: 'operation', title: 'Safe Operation' },
    { id: 'stability', title: 'Stability & Load Handling' },
    { id: 'inspection', title: 'Pre-Use Inspection' },
    { id: 'quiz', title: 'Final Quiz', isQuiz: true },
  ],
}

export function nonQuizModules() {
  return course.modules.filter((m) => !m.isQuiz)
}

export function computeCompletionPercent(completedModules) {
  const modules = nonQuizModules()
  const done = modules.filter((m) => completedModules.includes(m.id)).length

  return modules.length ? Math.round((done / modules.length) * 100) : 0
}

export function areAllNonQuizModulesComplete(completedModules) {
  return nonQuizModules().every((m) => completedModules.includes(m.id))
}
