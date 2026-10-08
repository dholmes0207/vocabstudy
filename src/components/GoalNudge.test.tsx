/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import GoalNudge from './GoalNudge'
import { useStudy } from '@/store/studyStore'
import { useSettings } from '@/store/settingsStore'
import { today } from '@/lib/date'
import { ALL_STICKERS } from '@/lib/stickers'

// The end of a session is where the day's gift should land: one line saying
// how close it is, or the gift itself the moment the goal is reached.

function withAnswersToday(n: number) {
  useStudy.setState({
    progress: {
      en: {
        cards: {},
        stats: {
          streak: 1,
          lastStudyDay: today(),
          totalReviews: n,
          totalCorrect: n,
          xp: 0,
          newByDay: {},
          reviewsByDay: { [today()]: n },
        },
      },
    },
  })
}

beforeEach(() => {
  useSettings.setState({ currentLang: 'en', dailyGoal: 10 })
})
afterEach(cleanup)

describe('GoalNudge', () => {
  it('says how many answers are left before the gift', () => {
    withAnswersToday(7)
    render(<GoalNudge />)
    expect(screen.getByText(/câu nữa là đạt mục tiêu/)).toHaveTextContent('Còn 3 câu')
  })

  it('opens and shows the gift once the goal is reached', () => {
    withAnswersToday(10)
    render(<GoalNudge />)
    const idx = useStudy.getState().progress.en.stats.stickers?.[today()]
    expect(idx).toBeDefined()
    expect(screen.getByText(ALL_STICKERS[idx!].en)).toBeInTheDocument()
  })
})
