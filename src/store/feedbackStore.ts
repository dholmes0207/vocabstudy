import { create } from 'zustand'
import type { ContentRef } from '@/lib/feedback'

/**
 * Whether the in-app feedback form is open (components/FeedbackDialog.tsx), and
 * when it was opened from a word card or a question, what it reports.
 */
export const useFeedbackDialog = create<{ open: boolean; about: ContentRef | null }>(() => ({
  open: false,
  about: null,
}))

export const openFeedback = () => useFeedbackDialog.setState({ open: true, about: null })
export const reportContent = (about: ContentRef) =>
  useFeedbackDialog.setState({ open: true, about })
export const closeFeedback = () => useFeedbackDialog.setState({ open: false, about: null })
