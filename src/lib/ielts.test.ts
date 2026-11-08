import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  TASK2_WORDS,
  axisMax,
  blankRight,
  clock,
  drillRound,
  headingsRight,
  summaryParts,
  informalBits,
  linkersUsed,
  paragraphCount,
  pickOther,
  pickPassage,
  readingRound,
  validateIeltsBank,
  wordCount,
} from './ielts'
import { mulberry32 } from './sky'

const raw = () => JSON.parse(readFileSync('public/data/ielts/en.json', 'utf8'))

describe('the IELTS bank', () => {
  it('passes its check, and every passage practises all three answers', () => {
    const bank = validateIeltsBank(raw())
    expect(bank.reading.length).toBeGreaterThanOrEqual(6)
    for (const p of bank.reading) {
      expect(new Set(p.questions.map((q) => q.answer)), p.id).toEqual(new Set(['T', 'F', 'NG']))
      expect(new Set(p.questions.map((q) => q.statement)).size, p.id).toBe(p.questions.length)
    }
  })

  it('turns down a broken edit', () => {
    const broken = (edit: (b: ReturnType<typeof raw>) => void) => {
      const b = raw()
      edit(b)
      return () => validateIeltsBank(b)
    }
    expect(broken((b) => delete b.reading)).toThrow(/"reading" is missing/)
    expect(broken((b) => (b.reading[1].id = b.reading[0].id))).toThrow(/repeated/)
    expect(broken((b) => (b.reading[0].questions[0].answer = 'YES'))).toThrow(/bad answer/)
    expect(broken((b) => (b.reading[0].questions[0].why = ''))).toThrow(/no explanation/)
    expect(broken((b) => (b.reading[0].passage = []))).toThrow(/no text/)
  })
})

describe('summary completion', () => {
  const bank = validateIeltsBank(raw())

  it('splits a summary into text and gaps', () => {
    expect(summaryParts('Tea was a {0} and came by {1}.')).toEqual([
      'Tea was a ',
      0,
      ' and came by ',
      1,
      '.',
    ])
    expect(summaryParts('{0} first')).toEqual([0, ' first'])
  })

  it('gives every passage a summary with spare words, its answers not in box order', () => {
    for (const p of bank.reading) {
      const sm = p.summary
      expect(sm.box.length - sm.answers.length, p.id).toBeGreaterThanOrEqual(2)
      expect(sm.answers, p.id).not.toEqual([...sm.answers].sort((a, b) => a - b))
      // Each reason points to the paragraph that gives the word.
      sm.answers.forEach((_, i) => expect(sm.why[i], `${p.id} gap ${i}`).toMatch(/Đoạn \d/))
    }
  })

  it('turns down a summary whose gaps or box do not add up', () => {
    const broken = (edit: (b: ReturnType<typeof raw>) => void) => {
      const b = raw()
      edit(b)
      return () => validateIeltsBank(b)
    }
    const sm = (b: ReturnType<typeof raw>) => b.reading[0].summary
    expect(broken((b) => (sm(b).text = 'No gaps here.'))).toThrow(/gaps \{0\}/)
    expect(broken((b) => (sm(b).text = sm(b).text.replace('{1}', '{5}')))).toThrow(/in order/)
    expect(broken((b) => (sm(b).box = sm(b).box.slice(0, 4)))).toThrow(/spare words/)
    expect(broken((b) => (sm(b).answers = [0, 0, 1, 2]))).toThrow(/one word per gap/)
    expect(broken((b) => sm(b).why.pop())).toThrow(/a reason per gap/)
  })
})

describe('matching headings', () => {
  const bank = validateIeltsBank(raw())

  it('gives every passage spare headings, and puts the right ones out of order', () => {
    for (const p of bank.reading) {
      const h = p.headings
      expect(h.options.length, p.id).toBeGreaterThanOrEqual(p.passage.length + 2)
      expect(new Set(h.options).size, p.id).toBe(h.options.length)
      // Not simply i, ii, iii in paragraph order.
      expect(h.answers, p.id).not.toEqual(h.answers.map((_, i) => i))
    }
  })

  it('scores the paragraphs given their own heading', () => {
    const h = bank.reading[0].headings
    expect(headingsRight(h, h.answers)).toBe(h.answers.length)
    expect(headingsRight(h, [h.answers[0], null, null])).toBe(1)
    expect(
      headingsRight(
        h,
        h.answers.map(() => null)
      )
    ).toBe(0)
  })

  it('turns down headings that cannot be matched', () => {
    const broken = (edit: (b: ReturnType<typeof raw>) => void) => {
      const b = raw()
      edit(b)
      return () => validateIeltsBank(b)
    }
    const h = (b: ReturnType<typeof raw>) => b.reading[0].headings
    expect(broken((b) => (h(b).options = h(b).options.slice(0, 3)))).toThrow(
      /more headings than paragraphs/
    )
    expect(broken((b) => (h(b).answers = [0, 0, 1]))).toThrow(/one different heading/)
    expect(broken((b) => (h(b).answers = [0, 1, 9]))).toThrow(/one different heading/)
    expect(broken((b) => h(b).why.pop())).toThrow(/a reason per heading/)
  })
})

describe('picking a passage', () => {
  const { reading } = validateIeltsBank(raw())

  it('offers one not read yet, and never the one just done', () => {
    const done = new Set(reading.slice(1).map((p) => p.id))
    for (let seed = 1; seed < 10; seed++)
      expect(pickPassage(reading, (id) => done.has(id), undefined, mulberry32(seed)).id).toBe(
        reading[0].id
      )
    for (let seed = 1; seed < 10; seed++)
      expect(pickPassage(reading, () => true, reading[2].id, mulberry32(seed)).id).not.toBe(
        reading[2].id
      )
  })

  it('shuffles the statements but keeps each with its answer', () => {
    const p = reading[0]
    const round = readingRound(p, mulberry32(4))
    expect([...round.questions].sort((a, b) => a.statement.localeCompare(b.statement))).toEqual(
      [...p.questions].sort((a, b) => a.statement.localeCompare(b.statement))
    )
  })
})

describe('speaking practice', () => {
  const { speaking } = validateIeltsBank(raw())

  it('has Part 1 topics and Part 2 cards with a plan, phrases and Part 3 questions', () => {
    expect(speaking.part1.length).toBeGreaterThanOrEqual(6)
    expect(speaking.part2.length).toBeGreaterThanOrEqual(6)
    for (const c of speaking.part2) {
      expect(c.cue, c.id).toMatch(/^Describe /)
      expect(c.points.at(-1), c.id).toMatch(/^and explain/)
    }
    const ids = [...speaking.part1, ...speaking.part2].map((x) => x.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every Part 1 question a sample answer with a key phrase inside it', () => {
    for (const tp of speaking.part1) {
      expect(tp.samples.length, tp.id).toBe(tp.questions.length)
      for (const x of tp.samples) expect(x.a, tp.id).toContain(x.key)
    }
    const b = raw()
    b.speaking.part1[0].samples[0].key = 'not in the answer'
    expect(() => validateIeltsBank(b)).toThrow(/sample answer/)
    const c = raw()
    c.speaking.part1[0].samples.pop()
    expect(() => validateIeltsBank(c)).toThrow(/sample answer/)
  })

  it('turns down a card without its Part 3', () => {
    const b = raw()
    b.speaking.part2[0].part3 = []
    expect(() => validateIeltsBank(b)).toThrow(/Part 3 questions/)
    const c = raw()
    delete c.speaking
    expect(() => validateIeltsBank(c)).toThrow(/"speaking" is missing/)
  })

  it('never gives the same topic twice in a row, and shows time as m:ss', () => {
    for (let seed = 1; seed < 10; seed++)
      expect(pickOther(speaking.part1, 'food', mulberry32(seed)).id).not.toBe('food')
    expect(clock(65)).toBe('1:05')
    expect(clock(120)).toBe('2:00')
  })
})

describe('writing practice', () => {
  const { writing } = validateIeltsBank(raw())

  it('has the four kinds of Task 2 essay, each with prompts to try', () => {
    expect(writing.types.map((w) => w.id).sort()).toEqual(
      ['advantages', 'discussion', 'opinion', 'problem-solution'].sort()
    )
    for (const w of writing.types)
      expect(
        writing.prompts.some((p) => p.type === w.id),
        w.id
      ).toBe(true)
  })

  it('shuffles drill options but keeps the right answer', () => {
    const round = drillRound(writing.drills, 10, mulberry32(5))
    expect(round).toHaveLength(10)
    for (const d of round) {
      const original = writing.drills.find((x) => x.prompt === d.prompt)!
      expect(d.options[d.answer]).toBe(original.options[original.answer])
    }
  })

  it('counts words and paragraphs, and spots linking words and spoken forms', () => {
    const essay =
      "Firstly, I don't think kids should study a lot of hours. However, it's well-known.\n\nIn conclusion, on the other hand ok 2020."
    expect(wordCount(essay)).toBe(22)
    expect(paragraphCount(essay)).toBe(2)
    expect(linkersUsed(essay).sort()).toEqual(
      ['firstly', 'however', 'in conclusion', 'on the other hand'].sort()
    )
    expect(informalBits(essay).sort()).toEqual(['a lot of', "don't", "it's", 'kids'].sort())
    expect(informalBits('Governments should take action. It is clear.')).toEqual([])
    expect(TASK2_WORDS).toBe(250)
  })

  it('turns down a drill whose answer is out of range', () => {
    const b = raw()
    b.writing.drills[0].answer = 9
    expect(() => validateIeltsBank(b)).toThrow(/bad answer/)
    const c = raw()
    c.writing.prompts[0].type = 'poem'
    expect(() => validateIeltsBank(c)).toThrow(/no known type/)
  })
})

describe('listening practice', () => {
  const { listening } = validateIeltsBank(raw())

  it('has calls with two speakers and a form of answers the call says', () => {
    expect(listening.length).toBeGreaterThanOrEqual(4)
    for (const l of listening) {
      expect(new Set(l.lines.map((x) => x.speaker)), l.id).toEqual(new Set(['W', 'M']))
      const said = l.lines.map((x) => x.text.toLowerCase()).join(' ')
      // Every word answer is heard (numbers may be said in words).
      for (const f of l.form.fields)
        if (!/\d/.test(f.answer))
          expect(said, `${l.id}: ${f.label}`).toContain(f.answer.toLowerCase())
    }
  })

  it('has Part 2 talks and Part 3 discussions, each with a trap the recording mentions', () => {
    const { listeningChoice } = validateIeltsBank(raw())
    expect(new Set(listeningChoice.map((c) => c.part))).toEqual(new Set([2, 3]))
    for (const c of listeningChoice) {
      const said = c.lines.map((l) => l.text.toLowerCase()).join(' ')
      // Part 2 is one voice, Part 3 two.
      expect(new Set(c.lines.map((l) => l.speaker)).size, c.id).toBe(c.part === 2 ? 1 : 2)
      // Most questions have a wrong option the recording says too, as in the real test.
      const trapped = c.questions.filter((q) =>
        q.options.some(
          (o, j) => j !== q.answer && said.includes(o.toLowerCase().replace(/^(in|on|the|a) /, ''))
        )
      )
      expect(trapped.length, c.id).toBeGreaterThanOrEqual(c.questions.length / 2)
    }
  })

  it('turns down a question whose answer is out of range', () => {
    const b = raw()
    b.listeningChoice[0].questions[0].answer = 3
    expect(() => validateIeltsBank(b)).toThrow(/is incomplete/)
  })

  it('marks a blank right whatever the case, punctuation or spaces in a number', () => {
    const phone = { answer: '0796 328 514', accept: ['0796328514'] }
    expect(blankRight('0796328514', phone)).toBe(true)
    expect(blankRight(' 0796 328 514 ', phone)).toBe(true)
    expect(blankRight('0796 328 541', phone)).toBe(false)
    const street = { answer: 'Garden Road' }
    expect(blankRight('garden road.', street)).toBe(true)
    expect(blankRight('Garden', street)).toBe(false)
    expect(blankRight('', street)).toBe(false)
    expect(blankRight('forty-five', { answer: '45', accept: ['forty-five'] })).toBe(true)
  })
})

describe('writing task 1', () => {
  const { writing } = validateIeltsBank(raw())

  it('has line and bar charts, each with one right overview and a report to complete', () => {
    expect(new Set(writing.task1.map((c) => c.kind))).toEqual(new Set(['line', 'bar']))
    for (const c of writing.task1) {
      expect(c.overview.why[c.overview.answer], c.id).toMatch(/^Đúng/)
      // The right overview gives no figures; the others are a detail or wrong.
      expect(c.overview.options[c.overview.answer], c.id).not.toMatch(/\d/)
      expect(c.report.box.length - c.report.answers.length, c.id).toBeGreaterThanOrEqual(2)
    }
  })

  it('turns down a series that does not match its labels', () => {
    const b = raw()
    b.writing.task1[0].series[0].values.pop()
    expect(() => validateIeltsBank(b)).toThrow(/one value per label/)
    const c = raw()
    c.writing.task1[0].overview.why.pop()
    expect(() => validateIeltsBank(c)).toThrow(/overview options with a reason/)
  })

  it('rounds the chart axis up to 1, 2 or 5 times a power of ten', () => {
    expect([90, 45, 400, 7, 0, 101].map(axisMax)).toEqual([100, 50, 500, 10, 1, 200])
  })
})
