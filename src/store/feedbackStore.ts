import { create } from 'zustand'

/** Whether the in-app feedback form is open (components/FeedbackDialog.tsx). */
export const useFeedbackDialog = create<{ open: boolean }>(() => ({ open: false }))

export const openFeedback = () => useFeedbackDialog.setState({ open: true })
export const closeFeedback = () => useFeedbackDialog.setState({ open: false })
