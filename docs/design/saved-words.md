# Lưu từ khi đọc truyện

**User**: "Đọc truyện gặp từ chưa biết, chạm vào xem nghĩa xong là quên luôn. Muốn giữ lại từ
đó để học cho thuộc."

Tham khảo (`docs/research/2026-10-17-language-apps.md`, quét bằng REA):

- **Readlang**: mọi từ bạn bấm dịch đều tự được lưu thành thẻ ôn.
- **Du Chinese**: lưu từ chưa biết vào thẻ ôn.
- **LingQ**: đánh dấu từ gặp khi đọc **[PRIOR]**.

VocaStudy **không làm giống hệt**:

- Không tự lưu mọi từ được chạm vào. Người học chạm nhiều khi chỉ để chắc nghĩa, lưu hết
  thì lịch ôn đầy những từ đã biết.
- Không tạo thẻ ôn rời. Từ đã lưu đi qua đúng con đường của mọi từ mới trong app: làm quen
  → nhớ lại → ôn ngắt quãng. Nhờ vậy từ được học thật, không chỉ được đánh dấu.

**BA**

- Trong hộp nghĩa khi đọc truyện (`/reading/:id`), dưới phần nghĩa:
  - Từ **chưa học**: nút "Lưu để học". Bấm lần nữa để bỏ lưu.
  - Từ **đã lưu**: nút đổi thành "Đã lưu để học", kèm link "Học ngay" sang `/learn`.
  - Từ **đã có trong lịch ôn** (đã học ít nhất một lần): chỉ hiện dòng "Đã có trong lịch
    ôn", không có nút, vì từ đó đã được ôn đúng lúc rồi.
- Trang Học (`/learn`) có thẻ "Từ bạn đã lưu" phía trên "Bài học hôm nay":
  - Thẻ hiện số từ và tên các từ đang chờ học, theo thứ tự đã lưu.
  - Nút "Học N từ đã lưu" mở một bài học bình thường, mỗi lần tối đa 10 từ.
  - Học xong, từ tự rời danh sách vì đã có trong lịch ôn.
- Từ đã lưu học được **cả khi đã hết hạn mức từ mới** trong ngày, vì người học tự chọn những
  từ này.
  - Học xong, chúng vẫn được tính vào số từ mới của ngày (`recordAnswer` ghi `newByDay`
    như mọi từ mới), nên số từ app đề xuất hôm đó giảm tương ứng.
  - Nhờ vậy tổng số từ mới mỗi ngày không quá sức.
- Danh sách tách theo từng ngôn ngữ và **chỉ lưu trên máy**, giống tiến độ Đọc truyện. Trang
  Quyền riêng tư đã ghi thêm điều này. Danh sách nằm trong file sao lưu, vì khoá bắt đầu
  bằng `vocab.`.

**Dev**

- `store/savedWordsStore.ts` (`vocab.saved.v1`):
  - `saved: { [lang]: wordId[] }`, theo thứ tự lưu;
  - `toggle(lang, id)` thêm hoặc bỏ một từ;
  - `remove(lang, ids)` xoá nhiều từ một lần.
  - Không đụng tới dữ liệu ôn tập (`studyStore`), nên không phải sửa đồng bộ hay
    `normalizeProgress`.
- `lib/savedWords.ts` `pendingSaved(ids, words, cards)`:
  - trả về những từ đã lưu còn ở trạng thái `new` theo `phaseOf`, đúng thứ tự lưu;
  - bỏ qua id không còn trong gói.
- `components/SaveWordButton.tsx`: nút trong hộp nghĩa, dùng được ở chỗ khác sau này (Tra
  cứu, thẻ từ).
- `Learn`:
  - thêm thẻ "Từ bạn đã lưu", dùng lại `LearnSession` và `recordAnswer` như bộ từ thường;
  - một effect dọn khỏi danh sách những id đã có thẻ ôn, để danh sách không phình mãi.

## Bước tiếp theo

- Nút lưu ở trang Tra cứu và trên thẻ từ.
- Lưu cả từ chưa có trong gói: cần nghĩa do người học tự nhập, hoặc nhờ trợ lý AI.
