import { PrismaClient, Role, ExamType, Difficulty } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || '';
const ssl =
  connectionString.includes('sslmode=require') ||
  connectionString.includes('ssl=true') ||
  connectionString.includes('db.prisma.io')
    ? { rejectUnauthorized: false }
    : undefined;

const pool = new Pool({ connectionString, ssl });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing test data (optional in dev)
  await prisma.submissionAnswer.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.questionExplanation.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.examSection.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.userFlashcard.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Default Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@toeic.local',
      fullName: 'System Admin',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyUIXe/QLsuG6xnp3tp28PBxpxlh6U5.', // admin123
      role: Role.ADMIN,
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: 'student@toeic.local',
      fullName: 'Nguyen Van A',
      passwordHash: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyUIXe/QLsuG6xnp3tp28PBxpxlh6U5.', // admin123
      role: Role.STUDENT,
      targetScore: 750,
    },
  });

  console.log(`✅ Created users: Admin (${adminUser.email}), Student (${studentUser.email})`);

  // 3. Create Sample Mock Exam
  const sampleExam = await prisma.exam.create({
    data: {
      title: 'ETS TOEIC 2026 - Practice Test 01',
      slug: 'ets-toeic-2026-practice-test-01',
      type: ExamType.FULL_MOCK,
      totalQuestions: 200,
      durationMinutes: 120,
      isPublished: true,
      metadata: {
        difficultyLevel: 'Standard ETS',
        listeningQuestionsCount: 100,
        readingQuestionsCount: 100,
      },
    },
  });

  // 4. Create Section: Part 5 (Incomplete Sentences)
  const part5Section = await prisma.examSection.create({
    data: {
      examId: sampleExam.id,
      partNumber: 5,
      title: 'Part 5: Incomplete Sentences',
      instructions: 'A word or phrase is missing in each of the sentences below. Four answer choices are given below each sentence. Select the best answer to complete the sentence.',
    },
  });

  // 5. Create Sample Questions in Part 5
  const q101 = await prisma.question.create({
    data: {
      sectionId: part5Section.id,
      partNumber: 5,
      questionNumber: 101,
      content: 'Customer reviews indicate that many modern mobile devices are often _______ to operate.',
      difficulty: Difficulty.MEDIUM,
      tags: ['word_form', 'adjective_complement'],
      options: {
        create: [
          { optionKey: 'A', content: 'complication', isCorrect: false },
          { optionKey: 'B', content: 'complicated', isCorrect: true },
          { optionKey: 'C', content: 'complicate', isCorrect: false },
          { optionKey: 'D', content: 'complicating', isCorrect: false },
        ],
      },
      explanation: {
        create: {
          correctReason: 'Sau trạng từ "often" và cấu trúc "be + adj + to V", ta cần một tính từ miêu tả đặc tính của vật. "Complicated" là tính từ mang nghĩa "phức tạp".',
          incorrectReasons: {
            A: 'Danh từ (complication) không đứng sau động từ to be và trước "to operate" trong cấu trúc này.',
            C: 'Động từ nguyên mẫu (complicate) không phù hợp về mặt ngữ pháp sau "are often".',
            D: 'Dạng V-ing (complicating) thường mang nghĩa chủ động gây khó khăn cho cái gì khác, không tự nhiên trong cấu trúc này.',
          },
          translatedText: 'Các đánh giá của khách hàng chỉ ra rằng nhiều thiết bị di động hiện đại thường phức tạp khi vận hành.',
          vocabularyHighlights: {
            indicate: 'chỉ ra, cho biết',
            device: 'thiết bị',
            operate: 'vận hành, sử dụng',
          },
          grammarRule: 'Subject + be + (adv) + Adjective + to-infinitive',
          isAiGenerated: false,
        },
      },
    },
  });

  console.log(`✅ Seeded sample exam "${sampleExam.title}" with Question #${q101.questionNumber}`);

  // 6. Create Initial Flashcard for Student
  await prisma.userFlashcard.create({
    data: {
      userId: studentUser.id,
      word: 'indicate',
      ipa: '/ˈɪndɪkeɪt/',
      partOfSpeech: 'verb',
      meaningVi: 'chỉ ra, biểu thị, cho biết',
      exampleEn: 'Our survey indicates that customer satisfaction has increased.',
      exampleVi: 'Khảo sát của chúng tôi chỉ ra rằng sự hài lòng của khách hàng đã tăng lên.',
      srsInterval: 1,
      srsRepetition: 0,
      srsEaseFactor: 2.5,
    },
  });

  console.log('✅ Seeded initial flashcard.');
  console.log('🎉 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
