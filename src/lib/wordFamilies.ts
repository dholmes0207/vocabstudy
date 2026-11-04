import { ENDINGS, type FormCategory } from './wordFormDrill'

// "Ghép họ từ" (docs/design/toeic.md): about a third of TOEIC Part 5 asks the
// right form of one word (decide, decision, decisive, decisively). Seeing the
// whole family at once, and putting each form in its slot, is how the forms
// stick. The families are written by hand: the pack's word families carry no
// part of speech, and a family where noun and verb are spelt the same (benefit)
// keeps only one of them, so every slot has exactly one tile that fits.

type Pair = [en: string, vi: string]

export interface WordFamily {
  forms: Partial<Record<FormCategory, Pair>>
}

/** Slot order on screen: the order Part 5 explanations name them in. */
export const FAMILY_CATS: readonly FormCategory[] = ['noun', 'verb', 'adjective', 'adverb']

const f = (
  noun: Pair | null,
  verb: Pair | null,
  adjective: Pair | null,
  adverb: Pair | null
): WordFamily => ({
  forms: Object.fromEntries(
    Object.entries({ noun, verb, adjective, adverb }).filter(([, v]) => v)
  ) as WordFamily['forms'],
})

export const WORD_FAMILIES: readonly WordFamily[] = [
  f(
    ['decision', 'quyết định'],
    ['decide', 'quyết định'],
    ['decisive', 'dứt khoát'],
    ['decisively', 'một cách dứt khoát']
  ),
  f(
    ['success', 'sự thành công'],
    ['succeed', 'thành công'],
    ['successful', 'thành công'],
    ['successfully', 'thành công']
  ),
  f(
    ['production', 'sự sản xuất'],
    ['produce', 'sản xuất'],
    ['productive', 'năng suất'],
    ['productively', 'có năng suất']
  ),
  f(
    ['competition', 'sự cạnh tranh'],
    ['compete', 'cạnh tranh'],
    ['competitive', 'cạnh tranh'],
    ['competitively', 'một cách cạnh tranh']
  ),
  f(
    ['creation', 'sự sáng tạo'],
    ['create', 'tạo ra'],
    ['creative', 'sáng tạo'],
    ['creatively', 'một cách sáng tạo']
  ),
  f(
    ['information', 'thông tin'],
    ['inform', 'thông báo'],
    ['informative', 'nhiều thông tin'],
    null
  ),
  f(['dependence', 'sự phụ thuộc'], ['depend', 'phụ thuộc'], ['dependent', 'phụ thuộc'], null),
  f(
    ['attraction', 'sự thu hút'],
    ['attract', 'thu hút'],
    ['attractive', 'hấp dẫn'],
    ['attractively', 'hấp dẫn']
  ),
  f(
    ['preference', 'sự ưu tiên'],
    ['prefer', 'thích hơn'],
    ['preferable', 'đáng chọn hơn'],
    ['preferably', 'tốt hơn là']
  ),
  f(
    ['economy', 'nền kinh tế, sự tiết kiệm'],
    ['economize', 'tiết kiệm'],
    ['economical', 'tiết kiệm'],
    ['economically', 'một cách tiết kiệm']
  ),
  f(['employment', 'việc làm'], ['employ', 'tuyển dụng'], ['employable', 'dễ tìm được việc'], null),
  f(
    ['reliability', 'độ tin cậy'],
    ['rely', 'dựa vào'],
    ['reliable', 'đáng tin cậy'],
    ['reliably', 'một cách đáng tin cậy']
  ),
  f(
    ['difference', 'sự khác biệt'],
    ['differ', 'khác'],
    ['different', 'khác'],
    ['differently', 'một cách khác']
  ),
  f(
    ['appreciation', 'sự cảm kích'],
    ['appreciate', 'cảm kích, đánh giá cao'],
    ['appreciative', 'biết ơn'],
    ['appreciatively', 'một cách cảm kích']
  ),
  f(
    ['organization', 'tổ chức'],
    ['organize', 'tổ chức'],
    ['organizational', 'thuộc về tổ chức'],
    null
  ),
  f(
    ['operation', 'sự vận hành'],
    ['operate', 'vận hành'],
    ['operational', 'đang hoạt động'],
    ['operationally', 'về mặt vận hành']
  ),
  f(
    ['acceptance', 'sự chấp nhận'],
    ['accept', 'chấp nhận'],
    ['acceptable', 'chấp nhận được'],
    ['acceptably', 'ở mức chấp nhận được']
  ),
  f(['benefit', 'lợi ích'], null, ['beneficial', 'có lợi'], ['beneficially', 'có lợi']),
  f(['care', 'sự cẩn thận'], null, ['careful', 'cẩn thận'], ['carefully', 'cẩn thận']),
  f(['efficiency', 'hiệu suất'], null, ['efficient', 'hiệu quả'], ['efficiently', 'hiệu quả']),
  f(['punctuality', 'sự đúng giờ'], null, ['punctual', 'đúng giờ'], ['punctually', 'đúng giờ']),
  f(['confidence', 'sự tự tin'], null, ['confident', 'tự tin'], ['confidently', 'tự tin']),
  f(
    ['responsibility', 'trách nhiệm'],
    null,
    ['responsible', 'chịu trách nhiệm'],
    ['responsibly', 'có trách nhiệm']
  ),
  f(
    ['qualification', 'bằng cấp, trình độ'],
    ['qualify', 'đủ điều kiện'],
    ['qualified', 'đủ trình độ'],
    null
  ),
  f(
    ['persuasion', 'sự thuyết phục'],
    ['persuade', 'thuyết phục'],
    ['persuasive', 'có sức thuyết phục'],
    ['persuasively', 'đầy thuyết phục']
  ),
  f(
    ['impression', 'ấn tượng'],
    ['impress', 'gây ấn tượng'],
    ['impressive', 'ấn tượng'],
    ['impressively', 'một cách ấn tượng']
  ),
  f(
    ['satisfaction', 'sự hài lòng'],
    ['satisfy', 'làm hài lòng'],
    ['satisfactory', 'đạt yêu cầu'],
    ['satisfactorily', 'đạt yêu cầu']
  ),
  f(
    ['agreement', 'thoả thuận'],
    ['agree', 'đồng ý'],
    ['agreeable', 'dễ chịu, chấp nhận được'],
    ['agreeably', 'dễ chịu']
  ),
  f(
    ['strength', 'sức mạnh, điểm mạnh'],
    ['strengthen', 'củng cố'],
    ['strong', 'mạnh'],
    ['strongly', 'mạnh mẽ']
  ),
  f(['width', 'chiều rộng'], ['widen', 'mở rộng'], ['wide', 'rộng'], ['widely', 'rộng rãi']),
  f(
    ['simplicity', 'sự đơn giản'],
    ['simplify', 'đơn giản hoá'],
    ['simple', 'đơn giản'],
    ['simply', 'đơn giản là']
  ),
  f(['clarity', 'sự rõ ràng'], ['clarify', 'làm rõ'], ['clear', 'rõ ràng'], ['clearly', 'rõ ràng']),
  f(['possibility', 'khả năng'], null, ['possible', 'có thể'], ['possibly', 'có lẽ']),
  f(
    ['extension', 'sự gia hạn, số máy lẻ'],
    ['extend', 'kéo dài, gia hạn'],
    ['extensive', 'rộng, nhiều'],
    ['extensively', 'rộng rãi']
  ),
  f(
    ['innovation', 'sự đổi mới'],
    ['innovate', 'đổi mới'],
    ['innovative', 'đổi mới, sáng tạo'],
    ['innovatively', 'một cách đổi mới']
  ),
  f(
    ['addition', 'sự bổ sung'],
    ['add', 'thêm'],
    ['additional', 'thêm, bổ sung'],
    ['additionally', 'ngoài ra']
  ),
  f(['occasion', 'dịp'], null, ['occasional', 'thỉnh thoảng'], ['occasionally', 'thỉnh thoảng']),
  f(
    ['hesitation', 'sự do dự'],
    ['hesitate', 'do dự'],
    ['hesitant', 'do dự'],
    ['hesitantly', 'ngập ngừng']
  ),
  f(['profit', 'lợi nhuận'], null, ['profitable', 'có lãi'], ['profitably', 'có lãi']),
  f(
    ['analysis', 'sự phân tích'],
    ['analyze', 'phân tích'],
    ['analytical', 'thuộc phân tích'],
    ['analytically', 'về mặt phân tích']
  ),
  f(
    ['continuation', 'sự tiếp tục'],
    ['continue', 'tiếp tục'],
    ['continuous', 'liên tục'],
    ['continuously', 'liên tục']
  ),
  f(
    ['excess', 'sự dư thừa'],
    ['exceed', 'vượt quá'],
    ['excessive', 'quá mức'],
    ['excessively', 'quá mức']
  ),
  f(
    ['intention', 'ý định'],
    ['intend', 'định'],
    ['intentional', 'cố ý'],
    ['intentionally', 'cố ý']
  ),
  f(
    ['emphasis', 'sự nhấn mạnh'],
    ['emphasize', 'nhấn mạnh'],
    ['emphatic', 'dứt khoát, mạnh mẽ'],
    ['emphatically', 'dứt khoát']
  ),
  f(
    ['enthusiasm', 'sự nhiệt tình'],
    null,
    ['enthusiastic', 'nhiệt tình'],
    ['enthusiastically', 'nhiệt tình']
  ),
  f(['frequency', 'tần suất'], null, ['frequent', 'thường xuyên'], ['frequently', 'thường xuyên']),
  f(['accuracy', 'độ chính xác'], null, ['accurate', 'chính xác'], ['accurately', 'chính xác']),
  f(['convenience', 'sự tiện lợi'], null, ['convenient', 'tiện lợi'], ['conveniently', 'tiện lợi']),
  f(['residence', 'nơi ở'], ['reside', 'cư trú'], ['residential', 'thuộc khu dân cư'], null),
  f(
    ['collaboration', 'sự hợp tác'],
    ['collaborate', 'hợp tác'],
    ['collaborative', 'mang tính hợp tác'],
    ['collaboratively', 'cùng nhau']
  ),
  f(
    ['prediction', 'dự đoán'],
    ['predict', 'dự đoán'],
    ['predictable', 'đoán trước được'],
    ['predictably', 'như dự đoán']
  ),
  f(['variety', 'sự đa dạng'], ['vary', 'thay đổi, khác nhau'], ['various', 'nhiều loại'], null),
]

/** The forms of a family in slot order. */
export function familySlots(fam: WordFamily): { cat: FormCategory; en: string; vi: string }[] {
  return FAMILY_CATS.flatMap((cat) => {
    const p = fam.forms[cat]
    return p ? [{ cat, en: p[0], vi: p[1] }] : []
  })
}

/** The ending that marks a form's part of speech, when it has one of the drill's endings. */
export function markingEnding(form: string, cat: FormCategory): string | null {
  const rule = ENDINGS.find((e) => form.endsWith(e.ending) && form.length > e.ending.length + 2)
  return rule && rule.cat === cat ? rule.ending : null
}

/** A round of different families, in random order. */
export function familyRound(count = 6, rand: () => number = Math.random): WordFamily[] {
  const a = [...WORD_FAMILIES]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, count)
}
