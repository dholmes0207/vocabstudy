import { describe, expect, it } from 'vitest'
import {
  activeDaysByLearner,
  daysByDevice,
  deviceReport,
  percent,
  retentionReport,
  weekStart,
  type DeviceDay,
} from './retention'

describe('activeDaysByLearner', () => {
  it('joins a learner’s languages and keeps only days with activity', () => {
    const days = activeDaysByLearner([
      { user_id: 'a', reviews: { 100: 5, 101: 0 }, news: { 103: 2 } },
      { user_id: 'a', reviews: { 102: 1 } },
      { user_id: 'b', reviews: {}, news: null },
      { user_id: null, reviews: { 100: 1 } },
      { user_id: 'c', reviews: { 105: 'x', 106: 3 } },
    ])
    expect(days).toEqual([[100, 102, 103], [106]])
  })
})

describe('weekStart', () => {
  it('starts weeks on Monday', () => {
    // Epoch day 20384 is Thursday 2025-10-23; that week began Monday 2025-10-20.
    expect(weekStart(20384)).toBe(20381)
    expect(weekStart(20381)).toBe(20381)
    expect(weekStart(20387)).toBe(20381)
    expect(weekStart(20388)).toBe(20388)
  })
})

describe('retentionReport', () => {
  const today = 20390

  it('counts who came back the next day and within the first week', () => {
    const r = retentionReport(
      [
        [20370, 20371], // back the next day
        [20370, 20375], // back within the week, not the next day
        [20370, 20380], // only after the first week
        [20389, 20390], // next day counts; the week is not over yet
        [20390], // new today: too early for either
      ],
      today
    )
    expect(r.learners).toBe(5)
    expect(r.activeToday).toBe(2)
    expect(r.active7).toBe(2)
    expect(r.nextDay).toEqual({ eligible: 4, returned: 2 })
    expect(r.firstWeek).toEqual({ eligible: 3, returned: 2 })
  })

  it('groups learners by the week of their first day, newest first', () => {
    const r = retentionReport([[20381, 20382], [20387], [20374, 20400]], today, 3)
    expect(r.cohorts.map((c) => [c.week, c.learners])).toEqual([
      [20388, 0],
      [20381, 2],
      [20374, 1],
    ])
    expect(r.cohorts[1].nextDay).toEqual({ eligible: 2, returned: 1 })
  })

  it('shows no percentage until someone is eligible', () => {
    expect(percent({ eligible: 0, returned: 0 })).toBeNull()
    expect(percent({ eligible: 3, returned: 2 })).toBe('67%')
  })
})

describe('deviceReport', () => {
  const today = 20_100

  it('groups rows by device, sorts days and reads the first day’s lesson flag', () => {
    expect(
      daysByDevice([
        { device: 'b', day: 20_090, first_lesson: false },
        { device: 'a', day: 20_092 },
        { device: 'a', day: 20_090, first_lesson: true },
        { device: 42, day: 20_090 },
        { device: 'c', day: '20090' },
      ])
    ).toEqual([
      { days: [20_090], firstLesson: false },
      { days: [20_090, 20_092], firstLesson: true },
    ])
  })

  it('builds the four funnel steps, counting a window only once it has passed', () => {
    const rows: DeviceDay[] = [
      // Steady: first lesson, back the next day, 3 days in the first week.
      { device: 'a', day: 20_080, first_lesson: true },
      { device: 'a', day: 20_081 },
      { device: 'a', day: 20_085 },
      // Gone after the first day, first lesson not finished.
      { device: 'b', day: 20_080 },
      // Started yesterday: already counts for "next day" (as signed-in learners do), not yet for the week.
      { device: 'c', day: 20_099, first_lesson: true },
    ]
    const { funnel, retention } = deviceReport(rows, today)
    expect(funnel.devices).toBe(3)
    expect(funnel.firstLesson).toBe(2)
    expect(funnel.nextDay).toEqual({ eligible: 3, returned: 1 })
    expect(funnel.threeDaysFirstWeek).toEqual({ eligible: 2, returned: 1 })
    expect(retention.learners).toBe(3)
  })
})
