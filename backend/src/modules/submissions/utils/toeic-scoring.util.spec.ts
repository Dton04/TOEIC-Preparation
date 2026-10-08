import { describe, expect, it } from 'vitest';
import { calculateToeicScore } from './toeic-scoring.util.js';

describe('TOEIC Scoring Engine (ETS Standards)', () => {
  it('nên cho điểm tối đa 990 khi đúng 100/100 LC và 100/100 RC', () => {
    const result = calculateToeicScore(100, 100, 100, 100);
    expect(result.listeningScore).toBe(495);
    expect(result.readingScore).toBe(495);
    expect(result.totalScore).toBe(990);
    expect(result.accuracy).toBe(100);
  });

  it('nên cho điểm sàn 10 khi làm sai toàn bộ (0/100 LC và 0/100 RC)', () => {
    const result = calculateToeicScore(0, 100, 0, 100);
    expect(result.listeningScore).toBe(5);
    expect(result.readingScore).toBe(5);
    expect(result.totalScore).toBe(10);
    expect(result.accuracy).toBe(0);
  });

  it('nên tính điểm chuẩn xác ở mức trung bình (~50 câu đúng mỗi kỹ năng)', () => {
    const result = calculateToeicScore(50, 100, 50, 100);
    expect(result.listeningScore).toBe(250);
    expect(result.readingScore).toBe(225);
    expect(result.totalScore).toBe(475);
    expect(result.accuracy).toBe(50);
  });

  it('nên hỗ trợ quy đổi tỷ lệ chuẩn khi làm bài mini test (ví dụ 30 câu)', () => {
    // 24/30 đúng = 80% đúng (~80/100)
    const result = calculateToeicScore(24, 30, 0, 0);
    expect(result.listeningScore).toBe(420);
    expect(result.totalScore).toBe(420);
    expect(result.accuracy).toBe(80);
  });
});
