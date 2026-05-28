import { supabase } from './supabaseClient'
import { schema, COURSE_ID } from './schema'

export async function ensureProfile(user) {
  const p = schema.profiles

  const { data: existing, error: selectError } = await supabase
    .from(p.table)
    .select('*')
    .eq(p.id, user.id)
    .maybeSingle()

  if (selectError) throw selectError

  if (existing) {
    return existing
  }

  const insertRow = {
    [p.id]: user.id,
    [p.email]: user.email,
    [p.role]: 'operator',
  }

  const { data: created, error: insertError } = await supabase
    .from(p.table)
    .insert(insertRow)
    .select()
    .single()

  if (insertError) throw insertError

  return created
}

export async function getOrCreateProgress(userId) {
  const t = schema.progress

  const { data: existing, error: selectError } = await supabase
    .from(t.table)
    .select('*')
    .eq(t.userId, userId)
    .eq(t.courseId, COURSE_ID)
    .maybeSingle()

  if (selectError) throw selectError

  if (existing) {
    return existing
  }

  const insertRow = {
    [t.userId]: userId,
    [t.courseId]: COURSE_ID,
    [t.completedModules]: [],
    [t.completionPercent]: 0,
    [t.updatedAt]: new Date().toISOString(),
  }

  const { data: created, error: insertError } = await supabase
    .from(t.table)
    .insert(insertRow)
    .select()
    .single()

  if (insertError) throw insertError

  return created
}

export async function saveProgress({
  userId,
  completedModules,
  completionPercent,
}) {
  const t = schema.progress

  const updateRow = {
    [t.completedModules]: completedModules,
    [t.completionPercent]: completionPercent,
    [t.updatedAt]: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from(t.table)
    .update(updateRow)
    .eq(t.userId, userId)
    .eq(t.courseId, COURSE_ID)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function recordQuizAttempt({
  userId,
  score,
  totalQuestions,
  passed,
}) {
  const q = schema.quizAttempts

  const row = {
    [q.userId]: userId,
    [q.score]: score,
    [q.totalQuestions]: totalQuestions,
    [q.passed]: passed,
    [q.attemptedAt]: new Date().toISOString(),
  }

  const { error } = await supabase.from(q.table).insert(row)

  if (error) throw error
}

export async function getCompletion(userId) {
  const c = schema.completions

  const { data, error } = await supabase
    .from(c.table)
    .select('*')
    .eq(c.userId, userId)
    .eq(c.courseId, COURSE_ID)
    .maybeSingle()

  if (error) throw error

  return data
}

export async function upsertCompletion({ userId, quizScore }) {
  const c = schema.completions

  const row = {
    [c.userId]: userId,
    [c.courseId]: COURSE_ID,
    [c.quizScore]: quizScore,
    [c.passed]: true,
    [c.formalComplete]: true,
    [c.practicalRequired]: true,
    [c.certificationPending]: true,
    [c.acknowledged]: true,
    [c.completedAt]: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from(c.table)
    .upsert(row, {
      onConflict: `${c.userId},${c.courseId}`,
    })
    .select()
    .single()

  if (error) throw error

  return data
}
