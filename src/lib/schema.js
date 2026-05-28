export const COURSE_ID = 'forklift_osha_1910_178_l'

export const schema = {
  profiles: {
    table: 'profiles',
    id: 'id',
    email: 'email',
    role: 'role',
  },

  progress: {
    table: 'forklift_training_progress',
    userId: 'user_id',
    courseId: 'course_id',
    completedModules: 'completed_modules',
    completionPercent: 'completion_percent',
    updatedAt: 'updated_at',
  },

  quizAttempts: {
    table: 'forklift_quiz_attempts',
    userId: 'user_id',
    score: 'score',
    totalQuestions: 'total_questions',
    passed: 'passed',
    attemptedAt: 'attempted_at',
  },

  completions: {
    table: 'forklift_training_completions',
    userId: 'user_id',
    courseId: 'course_id',
    quizScore: 'quiz_score',
    passed: 'passed',
    formalComplete: 'formal_training_complete',
    practicalRequired: 'practical_evaluation_required',
    certificationPending: 'certification_pending',
    acknowledged: 'acknowledgment_checked',
    completedAt: 'completed_at',
  },
}
