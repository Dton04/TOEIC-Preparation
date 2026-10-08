/**
 * Bảng quy đổi điểm chuẩn ETS TOEIC (ETS Scaled Score Conversion Table)
 * Điểm thô (Raw Score: 0 - 100) -> Điểm quy đổi (Scaled Score: 5 - 495)
 */

// Bảng điểm chuẩn Listening (100 câu)
const LISTENING_SCORE_TABLE: number[] = [
  5,   // 0
  5,   // 1
  5,   // 2
  5,   // 3
  5,   // 4
  5,   // 5
  5,   // 6
  10,  // 7
  15,  // 8
  20,  // 9
  25,  // 10
  30,  // 11
  35,  // 12
  40,  // 13
  45,  // 14
  50,  // 15
  55,  // 16
  60,  // 17
  65,  // 18
  70,  // 19
  75,  // 20
  80,  // 21
  85,  // 22
  90,  // 23
  95,  // 24
  100, // 25
  110, // 26
  115, // 27
  120, // 28
  125, // 29
  130, // 30
  135, // 31
  140, // 32
  145, // 33
  150, // 34
  160, // 35
  165, // 36
  170, // 37
  175, // 38
  180, // 39
  185, // 40
  190, // 41
  195, // 42
  200, // 43
  210, // 44
  215, // 45
  220, // 46
  230, // 47
  240, // 48
  245, // 49
  250, // 50
  255, // 51
  260, // 52
  265, // 53
  270, // 54
  275, // 55
  280, // 56
  290, // 57
  295, // 58
  300, // 59
  305, // 60
  310, // 61
  320, // 62
  325, // 63
  330, // 64
  335, // 65
  340, // 66
  350, // 67
  355, // 68
  360, // 69
  365, // 70
  370, // 71
  375, // 72
  380, // 73
  385, // 74
  390, // 75
  395, // 76
  400, // 77
  405, // 78
  410, // 79
  420, // 80
  425, // 81
  430, // 82
  435, // 83
  440, // 84
  445, // 85
  450, // 86
  455, // 87
  460, // 88
  465, // 89
  470, // 90
  475, // 91
  480, // 92
  485, // 93
  490, // 94
  495, // 95
  495, // 96
  495, // 97
  495, // 98
  495, // 99
  495  // 100
];

// Bảng điểm chuẩn Reading (100 câu)
const READING_SCORE_TABLE: number[] = [
  5,   // 0
  5,   // 1
  5,   // 2
  5,   // 3
  5,   // 4
  5,   // 5
  5,   // 6
  5,   // 7
  5,   // 8
  5,   // 9
  10,  // 10
  15,  // 11
  20,  // 12
  25,  // 13
  30,  // 14
  35,  // 15
  40,  // 16
  45,  // 17
  50,  // 18
  55,  // 19
  60,  // 20
  65,  // 21
  70,  // 22
  75,  // 23
  80,  // 24
  85,  // 25
  90,  // 26
  95,  // 27
  100, // 28
  110, // 29
  115, // 30
  120, // 31
  125, // 32
  130, // 33
  135, // 34
  140, // 35
  145, // 36
  150, // 37
  160, // 38
  165, // 39
  170, // 40
  175, // 41
  180, // 42
  185, // 43
  190, // 44
  195, // 45
  200, // 46
  210, // 47
  215, // 48
  220, // 49
  225, // 50
  230, // 51
  235, // 52
  240, // 53
  245, // 54
  250, // 55
  255, // 56
  260, // 57
  265, // 58
  270, // 59
  275, // 60
  280, // 61
  285, // 62
  290, // 63
  295, // 64
  300, // 65
  305, // 66
  310, // 67
  320, // 68
  325, // 69
  330, // 70
  335, // 71
  340, // 72
  345, // 73
  350, // 74
  355, // 75
  360, // 76
  365, // 77
  370, // 78
  380, // 79
  385, // 80
  390, // 81
  395, // 82
  400, // 83
  405, // 84
  410, // 85
  415, // 86
  420, // 87
  425, // 88
  430, // 89
  435, // 90
  445, // 91
  450, // 92
  455, // 93
  465, // 94
  470, // 95
  480, // 96
  485, // 97
  490, // 98
  495, // 99
  495  // 100
];

export interface ToeicGradingResult {
  listeningRaw: number;
  listeningTotal: number;
  listeningScore: number;
  readingRaw: number;
  readingTotal: number;
  readingScore: number;
  totalScore: number;
  accuracy: number;
}

/**
 * Tính điểm quy đổi TOEIC từ số câu đúng
 */
export function calculateToeicScore(
  listeningCorrect: number,
  listeningTotal: number,
  readingCorrect: number,
  readingTotal: number,
): ToeicGradingResult {
  let listeningScore = 0;
  let readingScore = 0;

  // Tính scaled score cho Listening
  if (listeningTotal > 0) {
    const normalizedLRaw = Math.min(
      100,
      Math.max(0, Math.round((listeningCorrect / listeningTotal) * 100)),
    );
    listeningScore = LISTENING_SCORE_TABLE[normalizedLRaw] ?? 5;
  }

  // Tính scaled score cho Reading
  if (readingTotal > 0) {
    const normalizedRRaw = Math.min(
      100,
      Math.max(0, Math.round((readingCorrect / readingTotal) * 100)),
    );
    readingScore = READING_SCORE_TABLE[normalizedRRaw] ?? 5;
  }

  const totalQuestions = listeningTotal + readingTotal;
  const totalCorrect = listeningCorrect + readingCorrect;
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  let totalScore = 0;
  if (listeningTotal > 0 && readingTotal > 0) {
    totalScore = listeningScore + readingScore;
  } else if (listeningTotal > 0) {
    totalScore = listeningScore;
  } else if (readingTotal > 0) {
    totalScore = readingScore;
  }

  return {
    listeningRaw: listeningCorrect,
    listeningTotal,
    listeningScore,
    readingRaw: readingCorrect,
    readingTotal,
    readingScore,
    totalScore,
    accuracy,
  };
}
