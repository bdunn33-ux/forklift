import { supabase } from './supabaseClient'
import { COURSE_ID } from './schema'

export async function isTrainingAdmin() {
  try {
    const { data, error } = await supabase.rpc('is_training_admin')

    if (error) {
      console.warn('[adminDb] is_training_admin error:', error.message)
      return false
    }

    return Boolean(data)
  } catch (err) {
    console.warn('[adminDb] is_training_admin failed:', err?.message || err)
    return false
  }
}

export async function adminResetTraining({
  targetUserId,
  courseId = COURSE_ID,
  wipeAttempts = false,
} = {}) {
  if (!targetUserId) {
    throw new Error('[adminDb] adminResetTraining requires targetUserId')
  }

  const { error } = await supabase.rpc('admin_reset_forklift_training', {
    p_user_id: targetUserId,
    p_course_id: courseId,
    p_wipe_attempts: wipeAttempts,
  })

  if (error) {
    throw new Error(`[adminDb] Reset failed: ${error.message}`)
  }

  return true
}

export async function adminOverrideCompletion({
  targetUserId,
  courseId = COURSE_ID,
  quizScore = null,
  passed = true,
  acknowledgmentChecked = true,
} = {}) {
  if (!targetUserId) {
    throw new Error('[adminDb] adminOverrideCompletion requires targetUserId')
  }

  const { data, error } = await supabase.rpc(
    'admin_override_forklift_completion',
    {
      p_user_id: targetUserId,
      p_course_id: courseId,
      p_quiz_score: quizScore,
      p_passed: passed,
      p_ack_checked: acknowledgmentChecked,
    }
  )

  if (error) {
    throw new Error(`[adminDb] Override failed: ${error.message}`)
  }

  return data
}
