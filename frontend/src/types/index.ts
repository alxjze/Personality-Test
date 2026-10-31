export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface AiMeta {
  provider: string;
  model: string;
  simulated: boolean;
  generated_at: string;
  used_reflection?: boolean;
}

// ── Career reflection ────────────────────────────────────────────
export interface LikertOption { value: number; label: string }
export interface ReflectionQuestion {
  id: string;
  type: 'likert' | 'choice' | 'text';
  text: string;
  required: boolean;
  dimension?: string;
  options?: { value: string; label: string }[];
  max_length?: number;
  placeholder?: string;
}
export interface ReflectionCategory { id: string; title: string; description: string; questions: ReflectionQuestion[] }
export interface ReflectionQuestionnaire { version: string; likert: LikertOption[]; categories: ReflectionCategory[]; disclaimer: string }
export type ReflectionAnswers = Record<string, number | string>;

export interface ScoredItem { key: string; label: string; description?: string; score: number }
export interface CareerArea {
  id: string;
  name: string;
  score: number;
  description: string;
  why: string[];
  example_roles: string[];
  skills_to_explore: string[];
}
export interface NextStep { title: string; description: string; action: { label: string; href: string } | null }
export interface ReflectionResult {
  version: string;
  generated_at: string;
  method: string;
  disclaimer: string;
  summary: string;
  tags: string[];
  interests: ScoredItem[];
  strengths: ScoredItem[];
  growth_skills: ScoredItem[];
  work_preferences: ScoredItem[];
  all_preferences: ScoredItem[];
  values: ScoredItem[];
  all_values: ScoredItem[];
  career_areas: CareerArea[];
  other_areas: { id: string; name: string; score: number }[];
  reflection_questions: string[];
  development: { title: string; description: string }[];
  next_steps: NextStep[];
  goal: { focus: string; focus_label: string; text: string; clarity: number; readiness: number; experience: number };
}
export interface SavedReflection { id: number; result: ReflectionResult; answers?: ReflectionAnswers; created_at: string }
export interface ReflectionListItem { id: number; created_at: string; top_areas: { id: string; name: string; score: number }[] }

// ── Assistant ────────────────────────────────────────────────────
export interface Conversation { id: number; title: string; created_at: string; updated_at: string; message_count?: number }
export interface ChatMessage { id: number; role: 'user' | 'assistant'; content: string; meta: AiMeta | null; created_at: string | null }

// ── CV review ────────────────────────────────────────────────────
export interface CvCriterion { key: string; label: string; score: number; max: number; note: string }
export interface CvResult {
  summary: string;
  score: { overall: number; max: number; criteria: CvCriterion[]; note: string };
  strengths: string[];
  improvements: { area: string; suggestion: string; priority: 'tinggi' | 'sedang' | 'rendah' }[];
  skill_relevance: { matched: string[]; missing: string[]; note: string };
  bullet_rewrites: { original: string; improved: string; reason: string }[];
  questions_for_user: string[];
  meta: AiMeta;
}
export interface CvReviewSummary {
  id: number;
  source: 'upload' | 'paste';
  original_filename: string | null;
  has_file: boolean;
  target_job: string;
  consent_given: boolean;
  created_at: string;
  overall_score: number | null;
  simulated: boolean;
}
export interface CvReview extends CvReviewSummary { job_description: string | null; result: CvResult }

// ── Interview ────────────────────────────────────────────────────
export interface InterviewQuestion { question: string; focus: string; tip: string }
export interface StarElement { label: string; present: boolean; comment: string }
export interface InterviewFeedback {
  rating: 'kuat' | 'cukup' | 'perlu_diperbaiki';
  summary: string;
  star: Record<'situation' | 'task' | 'action' | 'result', StarElement>;
  strengths: string[];
  improvements: string[];
  improved_outline: string;
  meta: AiMeta;
}
export interface InterviewSummary {
  id: number;
  job_position: string;
  interview_type: string;
  total_questions: number;
  answered_count: number;
  simulated: boolean;
  created_at: string;
  updated_at: string;
}
export interface InterviewSession extends InterviewSummary {
  questions: InterviewQuestion[];
  answers: Record<string, { answer: string; answered_at: string }>;
  feedback: Record<string, InterviewFeedback>;
  meta: AiMeta;
}

// ── Profile / dashboard ──────────────────────────────────────────
export interface Profile { education: string | null; current_position: string | null; career_goal: string | null; updated_at: string | null }
export interface ConsentStatus {
  ai_processing: boolean;
  privacy_policy: boolean;
  versions: Record<string, string>;
  history: { id: number; consent_type: string; consent_version: string; accepted_at: string }[];
}
export interface DashboardData {
  counts: { reflections: number; cv_reviews: number; interviews: number; conversations: number };
  progress: { done: number; total: number; percent: number; milestones: { key: string; label: string; done: boolean; href: string }[] };
  latest_reflection: { id: number; created_at: string; summary: string; tags: string[]; career_areas: { name: string; score: number }[] } | null;
  recent_cv_reviews: CvReviewSummary[];
  recent_interviews: InterviewSummary[];
  recent_conversations: Conversation[];
  next_steps: { title: string; href: string | null }[];
}
