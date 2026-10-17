# Kiểm tra trình độ

**User**: "Mình đã biết kha khá từ rồi, mà vào học vẫn phải bắt đầu từ 'hello', 'thank you'.
Muốn app biết mình ở đâu để học tiếp từ đó."

Tham khảo (`docs/research/2026-10-17-language-apps.md`, quét bằng REA):

- **Talk To Me In Korean**: bài kiểm tra trình độ 3 phút để biết nên bắt đầu từ đâu.
- **Lingvist**: thuật toán xếp người học vào đúng trình độ.

Cách của VocaStudy, **không làm giống hệt**:

- Không hỏi "bạn có biết từ này không?". Người học tự khai thì hay đánh giá cao quá.
- Dùng đúng dạng câu hỏi sẵn có của app: nhìn từ, chọn nghĩa tiếng Việt trong 4 đáp án. Có
  thêm nút "Tôi chưa biết từ này" để khỏi phải đoán bừa.
- Kết quả **chỉ đổi chỗ bắt đầu** của bài Học. App không đánh dấu từ nào là "đã thuộc", nên
  số từ đã thuộc, huy hiệu và lịch ôn vẫn trung thực.

**BA**

- Trang Học có thẻ "Đã biết một ít rồi?" cho người mới (chưa làm bài kiểm tra và có dưới
  30 từ đã bắt đầu học). Thẻ dẫn tới `/placement`.
- Cách làm bài:
  - Từ trong gói được chia thành các **mức** theo thứ tự học. Ranh giới các mức là từ thứ
    25, 50, 100, 200…, gấp đôi mỗi lần.
    - Nhờ vậy người mới học cũng được xếp chính xác, còn người đã biết nhiều thì không phải
      làm quá nhiều câu.
    - Tiếng Anh (4.440 từ): 9 mức, tối đa 45 câu.
    - Tiếng Hàn, tiếng Trung: 4 mức, tối đa 20 câu.
  - Mỗi mức hỏi 5 từ chọn ngẫu nhiên trong mức đó. Đáp án sai lấy từ nghĩa của các từ cùng
    mức.
  - Đúng ít nhất 4/5 thì lên mức sau. Ít hơn thì dừng.
  - Không hiện đúng/sai từng câu, để bài làm nhanh và không nản.
- Kết quả:
  - Bắt đầu từ từ đầu tiên của mức chưa qua. App nói rõ: "Bài học sẽ bắt đầu từ từ thứ N:
    …", và đây chỉ là ước lượng từ số câu đã trả lời.
  - Hai nút: "Bắt đầu học từ đây" (lưu kết quả) và "Học từ đầu" (không lưu).
  - Không cộng XP, không đổi lịch ôn.
- Sau khi có kết quả:
  - Từ mới được đề xuất bắt đầu từ chỗ đó. Học hết phần phía sau thì app quay lại những
    từ đã bỏ qua mà chưa học.
  - Danh sách bộ từ trên trang Học mở ở bộ chứa chỗ bắt đầu.
  - Trang Học có dòng "Bắt đầu từ từ thứ N theo bài kiểm tra · Làm lại".
- Kết quả lưu theo từng ngôn ngữ, chỉ trên máy, giống tiến độ Đọc truyện.

**Dev**

- `lib/placement.ts` (thuần, có test):
  - `placementBands(n)` trả về ranh giới các mức;
  - `bandQuestions(words, band, rng)` tạo 5 câu bằng `makeQuestion(…, 'en-to-vi')`;
  - `passed(correct)`.
- `store/placementStore.ts` (`vocab.placement.v1`) lưu theo ngôn ngữ:
  `{ start, day, asked, correct }`.
- `lib/summary.ts` `nextNewWords(…, startAt)`: lấy từ mới từ `startAt` trở đi trước, rồi
  mới tới những từ trước đó.
- `features/placement/Placement.tsx` (`/placement`):
  - màn giới thiệu → câu hỏi → kết quả;
  - dùng `useImmersive` như các bài kiểm tra khác.
