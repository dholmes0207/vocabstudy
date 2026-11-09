# Câu nói líu lưỡi (09/11/2026)

**User**: "… luyện nói, luyện nghe… tạo hứng thú, hấp dẫn khi học, phong cách tránh nhàm chán".

## 1. Người học

- Người Việt hay vấp ở vài cặp âm cố định: tiếng Anh s/sh, r/l, th, âm cuối (-ed, -s, -n, -m); tiếng Trung s/sh,
  n/l, h/f và bốn thanh. Luyện từng từ thì nhàm; câu nói líu lưỡi gói đúng cặp âm đó vào một câu vui, dễ nhớ.

## 2. Cách làm

- Trang `/tongue-twisters` (gói tiếng Anh và tiếng Trung): 6 câu tiếng Anh (She sells seashells…, Red lorry,
  yellow lorry…), 5 câu tiếng Trung (四是四，十是十…, 妈妈骑马…), mỗi câu có nghĩa, dòng 🎯 cặp âm cần chú ý
  (cách đặt lưỡi, môi), pinyin cho tiếng Trung.
- Mỗi câu: "Nghe chậm" (tốc độ 0,7), "Nghe tốc độ thường", và ô ghi âm, nghe lại (dùng lại `AnswerRecorder`).
  Ghi âm một câu lần đầu trong lượt vào trang được +2 XP, ghi `twister`; đầu trang đếm số câu đã luyện.

## 3. Dev

- Dữ liệu trong `lib/tongueTwisters.ts`. Test kiểm mỗi câu có nghĩa, cặp âm, pinyin (chỉ tiếng Trung), không trùng.
- Các câu có trong `scripts/audio-texts/screens.json` để thu giọng; tốc độ chậm dùng `rate` của `pronounce`.
