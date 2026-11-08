# Tiếng lóng mạng tiếng Trung (网络用语, 08/11/2026)

**User**: "… ưu tiên tiếng Anh xong tiếng Trung… nhớ là tạo hứng thú, hấp dẫn khi học, phong cách tránh
nhàm chán".

## 1. Người học

- Nhiều người Việt học tiếng Trung vì Douyin, phim, ca nhạc Trung Quốc, và gặp ngay những từ sách giáo khoa
  không dạy: 内卷, 躺平, 学霸, 吃瓜… Không hiểu thì bình luận, phụ đề trở nên khó hiểu.
- Một số từ đã vào tiếng Việt qua âm Hán Việt ("nội quyển", "phật hệ", "học bá"), nên đây là chỗ học vui mà
  vẫn ôn được chữ và âm Hán Việt.

## 2. Cách làm

- 20 từ thông dụng, mỗi từ có pinyin, âm Hán Việt từng chữ, nghĩa (Việt, Anh) và một câu ví dụ có pinyin và
  nghĩa. Chỉ chọn từ lành, dùng được trong lớp học; không có từ tục hay chuyện chính trị.
- **Trang** `/slang`: thẻ từng từ với nút nghe, âm Hán Việt tô màu, mở "Ví dụ".
- **Luyện 10 câu**, xen kẽ hai chiều, mỗi câu một từ khác nhau: thấy từ (kèm pinyin, Hán Việt) chọn nghĩa,
  hoặc thấy nghĩa chọn từ. Trả lời xong có nút nghe, câu ví dụ. XP như trang "Thành ngữ", ghi `slang`.
- Không đưa vào lộ trình (không thuộc đề HSK); trang có trong Luyện tập và được thẻ "Hôm nay thử gì mới?"
  gợi ý.

## 3. Dev

- Dữ liệu và logic trong `lib/netSlang.ts` (như `lib/chengyu.ts`). Test kiểm mỗi từ đủ pinyin, số âm Hán Việt
  bằng số chữ, ví dụ có chứa từ, nghĩa không trùng; lượt chơi không lặp từ và đáp án đúng nằm trong phương án.
- Từ và câu ví dụ có trong `scripts/audio-texts/screens.json` để thu giọng.
