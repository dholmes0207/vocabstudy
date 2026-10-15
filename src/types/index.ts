// ============================================================================
// Core domain types — shared contract across data layer, logic and UI.
// ============================================================================

/** A single vocabulary entry as stored in a language pack. */
export interface Word {
  /** Stable id, unique within the language pack (1..N). */
  id: number
  /** The headword, e.g. "ability" or "a / an". */
  word: string
  /** IPA phonetic transcription (General American), e.g. "əˈbɪləˌti". */
  ipa: string
  /** Approximate Vietnamese-style reading ("cách đọc"), e.g. "ơ-BI-lơ-ti". */
  viRead: string
  /** Raw part-of-speech label from the source, e.g. "n.", "v./n.". */
  pos: string
  /** Normalized primary part-of-speech category (noun/verb/adjective/...). */
  posCategory: PosCategory
  /** Meaning in the learner's native language (Vietnamese). */
  meaning: string
  /** Example sentence in the target language (English). */
  exampleEn: string
  /** Translation of the example sentence into the learner's language. */
  exampleVi: string

  // --- Depth ("hiểu sâu"). All optional: a pack without them is still valid. ---

  /** Common chunks the word lives in ("từ hay đi chung"), e.g. make a decision. */
  collocations?: WordChunk[]
  /** Related words from the same root ("từ cùng họ"), e.g. decide → decision. */
  family?: WordRelative[]
  /** One short note in the learner's language: a memory hook, a usage pattern or a typical mistake. */
  tip?: string
  /** A visual anchor for concrete words (dual coding), e.g. "🍎". */
  emoji?: string
  /**
   * Chinese pack: the Sino-Vietnamese reading (âm Hán Việt), one syllable per
   * character — 学生 "học sinh". Shown only where the meaning is shown too,
   * since it often gives the meaning away.
   */
  hanViet?: string
  /**
   * Curriculum stage: absent/1 = the core 1000 (A1–A2), 2 = the extension
   * beyond them (B1). Words are stored in learning order, stage 1 first.
   */
  stage?: number
}

export interface WordChunk {
  en: string
  vi: string
}

export interface WordRelative {
  word: string
  vi: string
}

export type PosCategory =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'pronoun'
  | 'determiner'
  | 'article'
  | 'other'

/** Metadata describing a language pack (also mirrored in the manifest). */
export interface LanguagePackMeta {
  /** ISO-ish language code, e.g. "en". Used as the storage namespace. */
  code: string
  name: string
  nativeName: string
  flag: string
  learnerLang: string
  learnerLangName: string
  /** BCP-47 tag passed to the Web Speech API, e.g. "en-US". */
  ttsLang: string
  count: number
  source?: string
  version?: string
  file?: string
  description?: string
  /** A young pack: small, browser voices only. Shown with a "Beta" chip. */
  beta?: boolean
  /**
   * What `viRead` is, when it is a standard romanisation rather than a
   * Vietnamese-style respelling: ["pinyin", "pinyin"] for Chinese. Cards then
   * say "pinyin: nǐ hǎo" instead of "reads like …".
   */
  readingLabel?: [vi: string, en: string]
}

/** A fully loaded language pack: metadata + word list. */
export interface LanguagePack {
  meta: LanguagePackMeta
  words: Word[]
}

/** The manifest at /public/data/index.json listing all available packs. */
export interface DataManifest {
  version: string
  defaultLang: string
  languages: LanguagePackMeta[]
}

/** A pre-rendered TTS voice available for a language (edge-tts). */
export interface AudioVoice {
  /** Folder name / stored settings value, e.g. "aria". */
  key: string
  /** Human label shown in the picker, e.g. "Aria — Nữ (Mỹ)". */
  label: string
  /** The underlying edge-tts voice id, e.g. "en-US-AriaNeural". */
  voice: string
}

/** The audio manifest at /public/audio/<code>/index.json. */
export interface AudioManifest {
  default: string
  voices: AudioVoice[]
}

/** An AI provider preset the admin configures; students pick one by label. */
export interface AIProvider {
  id: string
  /** Friendly name shown to students, e.g. "GPT o4-mini (lớp)". */
  label: string
  /** Model id, e.g. "o4-mini". */
  model: string
  /** API key — visible only to admin. */
  apiKey: string
  /** API base URL (OpenAI or a proxy). */
  baseUrl: string
}

// ============================================================================
// Spaced-Repetition (SRS) types
// ============================================================================

/** Lifecycle phase of a word for the learner, derived from its Leitner box. */
export type CardPhase = 'new' | 'learning' | 'review' | 'mastered'

/**
 * Per-word learning progress. Absence of a card for a word id means the word
 * is still "new" (never studied). We only persist words the learner touched.
 */
export interface SRSCard {
  id: number
  /**
   * Leitner box index 0..MASTERED_BOX. Box b means the card has passed b
   * successful answers and is waiting for INTERVALS[b] days (if b < length).
   * Mastery is `MASTERED_BOX` (= INTERVALS.length + 1), i.e. the card must also
   * clear the final 30-day wait — see `src/lib/srs.ts`.
   */
  box: number
  /** Epoch day number (local) on which the card becomes due for review. */
  dueDay: number
  /** Epoch day number of the last review, or null if never reviewed. */
  lastReviewedDay: number | null
  correctCount: number
  wrongCount: number
  /** Epoch day number when the card entered the SRS (first learned). */
  createdDay: number
}

/** Aggregate study statistics for one language, persisted per language code. */
export interface StudyStats {
  /** Consecutive-day study streak. */
  streak: number
  /** Epoch day of the most recent study activity. */
  lastStudyDay: number | null
  /** Total number of review answers ever submitted. */
  totalReviews: number
  totalCorrect: number
  /** Experience points for light gamification. */
  xp: number
  /** New words introduced, keyed by epoch day -> count. */
  newByDay: Record<number, number>
  /** Reviews done, keyed by epoch day -> count. */
  reviewsByDay: Record<number, number>
  /** Streak shields held: one forgives a single missed day (lib/motivation). */
  shields?: number
  /** Longest streak ever reached. */
  bestStreak?: number
  /** The day a shield last saved the streak (shown once on the dashboard). */
  shieldUsedDay?: number | null
  /** "Quà mỗi ngày": the sticker each goal-reaching day gave (day → index into ALL_STICKERS). */
  stickers?: Record<number, number>
}

/** Everything we persist for a single language's progress. */
export interface LanguageProgress {
  cards: Record<number, SRSCard>
  stats: StudyStats
}

// ============================================================================
// Quiz types
// ============================================================================

export type QuizMode =
  | 'en-to-vi' // show English word, pick Vietnamese meaning
  | 'vi-to-en' // show Vietnamese meaning, pick English word
  | 'listen' // hear the word (TTS), pick the English word
  | 'fill' // type the word given meaning + gapped example
  | 'spell' // type the whole word from a partial skeleton (abi__ty) + audio
  | 'context' // pick the English word that fits the gapped example sentence

export interface QuizQuestion {
  wordId: number
  mode: QuizMode
  /** The main prompt text (word, meaning, or gapped sentence). */
  prompt: string
  /** Secondary hint line (e.g. part of speech, or example translation). */
  hint?: string
  /** Multiple-choice options (empty for `fill` typing questions). */
  options: QuizOption[]
  /** The correct answer string (used for `fill` and to mark options). */
  answer: string
  /**
   * The exact form hidden in a gapped sentence ("hands" for the word "hand"),
   * for `fill` / `context` questions. Typing it is as correct as the headword.
   */
  surface?: string
}

export interface QuizOption {
  text: string
  correct: boolean
  wordId: number
}

// ============================================================================
// Settings
// ============================================================================

export type ThemeSetting = 'light' | 'dark' | 'system'

/** The animated sky behind the app (see lib/sky). "auto" = full on desktop, light on phones. */
export type SkyEffects = 'auto' | 'full' | 'lite' | 'off'

/** Interface language (menus, buttons, messages). Word meanings stay Vietnamese. */
export type UiLang = 'en' | 'vi'

/**
 * How due words are reviewed: `recall` asks a question (harder as the card
 * matures); `flip` is the classic flashcard with self-grading.
 */
export type ReviewStyle = 'recall' | 'flip'

/** How close a spoken attempt must be to count as correct (see lib/pronunciation). */
export type Strictness = 'easy' | 'normal' | 'hard'

export interface Settings {
  theme: ThemeSetting
  /** Active language code. */
  currentLang: string
  /** Max brand-new words introduced per day. */
  dailyNewLimit: number
  /** Max due reviews surfaced per session (0 = unlimited). */
  dailyReviewLimit: number
  /** TTS playback rate (0.5 - 1.25). */
  ttsRate: number
  /** Auto-estimate the learner level from progress (vs. manual override). */
  autoLevel: boolean
  /** Manual level (1..5) used when autoLevel is off. */
  level: number
  /** Selected pre-rendered voice key (edge-tts), e.g. "aria". */
  audioVoice: string
  /** Pinned browser-TTS voice (voiceURI) for the fallback when no audio exists. */
  ttsVoiceURI: string | null
  /** Whether to auto-play pronunciation when a flashcard is revealed. */
  autoSpeak: boolean
  /** How close a spoken attempt must be to count as correct. */
  speechStrictness: Strictness
  /** Play the correct/wrong feedback blips during quizzes. */
  soundEnabled: boolean
  /** Review by answering questions (default) or by flipping cards. */
  reviewStyle: ReviewStyle
  /** How much of the animated sky (stars, aurora, shooting stars) to draw. */
  skyEffects: SkyEffects
  /** Snow falling over the sky. */
  snow: boolean
  /** Sparkles that follow the mouse / burst on tap. */
  cursorTrail: boolean
  /** Answers per day the learner aims for (a small, reachable goal). */
  dailyGoal: number
  /** Interface language; English unless the learner picks Vietnamese. */
  uiLang: UiLang
}
