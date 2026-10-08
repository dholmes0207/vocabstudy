# Nghe thụ động (`/listen`)

**User** (người mất gốc, đi làm về mệt): "Tối về mệt, không muốn bấm gì cả. Đi xe buýt
cũng muốn tranh thủ — có cách nào chỉ cần nghe thôi không?"

**BA** — một playlist rảnh tay, không chấm điểm:

- Nguồn: _Từ đã học_ (gần đây nhất, xáo trộn), _Từ hay quên_ (sai nhiều nhất trước),
  _Từ sắp học_ (20 từ chưa học kế tiếp — nghe trước để khi học thật thấy quen tai).
- Mỗi từ: từ → nghỉ → nghĩa (đọc to bằng giọng tiếng Việt nếu máy có, không thì
  hiện chữ đủ lâu để đọc) → nghỉ → từ lần nữa (chậm hơn) → câu ví dụ → nghỉ → từ kế.
- Nhịp: Nhanh / Vừa / Thong thả (nhân mọi khoảng nghỉ).
- Điều khiển: tạm dừng, từ trước, từ sau; Media Session để dừng/chuyển ngay ở màn
  hình khoá hoặc tai nghe.
- Không đụng đến lịch ôn (SRS) và mục tiêu ngày — chỉ là "cho vào tai".
- Lối vào: thẻ "Nghe thụ động" ở Luyện tập; nút "Chỉ nghe thôi" trên thẻ chào mừng
  quay lại (người vừa nghỉ lâu thường ngại làm bài ngay).
- Kết thúc: chúc mừng, gợi ý "Học nhanh 2 phút" để biến nghe thành nhớ.

**Dev** — `src/lib/listen.ts` (thuần, có test): `pickListenWords`, `listenSteps`,
`defaultSource`, `isHard`. `src/features/listen/Listen.tsx` chạy từng bước bằng
`pronounce` (MP3 trước, Web Speech dự phòng), mỗi bước có timeout an toàn để playlist
không bao giờ kẹt; tạm dừng/chuyển từ huỷ lượt chạy hiện tại. Không bao giờ đọc tiếng
Việt bằng giọng tiếng Anh: chỉ đọc nghĩa khi `listVoices('vi')` có giọng.
