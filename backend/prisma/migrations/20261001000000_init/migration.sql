-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('FULL_MOCK', 'MINI_TEST', 'PART_PRACTICE');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'TIMEOUT');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "target_score" INTEGER,
    "target_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ExamType" NOT NULL DEFAULT 'FULL_MOCK',
    "total_questions" INTEGER NOT NULL DEFAULT 200,
    "duration_minutes" INTEGER NOT NULL DEFAULT 120,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_sections" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "part_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "audio_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "part_number" INTEGER NOT NULL,
    "question_number" INTEGER NOT NULL,
    "content" TEXT,
    "audio_url" TEXT,
    "image_url" TEXT,
    "passage_context" JSONB,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "option_key" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_explanations" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "correct_reason" TEXT NOT NULL,
    "incorrect_reasons" JSONB,
    "translated_text" TEXT,
    "vocabulary_highlights" JSONB,
    "grammar_rule" TEXT,
    "is_ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_explanations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "listening_score" INTEGER,
    "reading_score" INTEGER,
    "total_score" INTEGER,
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_answers" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option_id" TEXT,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "time_spent_seconds" INTEGER,

    CONSTRAINT "submission_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_flashcards" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "ipa" TEXT,
    "part_of_speech" TEXT,
    "meaning_vi" TEXT NOT NULL,
    "example_en" TEXT,
    "example_vi" TEXT,
    "srs_interval" INTEGER NOT NULL DEFAULT 1,
    "srs_repetition" INTEGER NOT NULL DEFAULT 0,
    "srs_ease_factor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "next_review_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_flashcards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "exams_slug_key" ON "exams"("slug");

-- CreateIndex
CREATE INDEX "questions_part_number_idx" ON "questions"("part_number");

-- CreateIndex
CREATE UNIQUE INDEX "questions_section_id_question_number_key" ON "questions"("section_id", "question_number");

-- CreateIndex
CREATE UNIQUE INDEX "question_options_question_id_option_key_key" ON "question_options"("question_id", "option_key");

-- CreateIndex
CREATE UNIQUE INDEX "question_explanations_question_id_key" ON "question_explanations"("question_id");

-- CreateIndex
CREATE INDEX "submissions_user_id_exam_id_idx" ON "submissions"("user_id", "exam_id");

-- CreateIndex
CREATE UNIQUE INDEX "submission_answers_submission_id_question_id_key" ON "submission_answers"("submission_id", "question_id");

-- CreateIndex
CREATE INDEX "user_flashcards_user_id_next_review_at_idx" ON "user_flashcards"("user_id", "next_review_at");

-- AddForeignKey
ALTER TABLE "exam_sections" ADD CONSTRAINT "exam_sections_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "exam_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_explanations" ADD CONSTRAINT "question_explanations_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_answers" ADD CONSTRAINT "submission_answers_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_answers" ADD CONSTRAINT "submission_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_answers" ADD CONSTRAINT "submission_answers_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "question_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_flashcards" ADD CONSTRAINT "user_flashcards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
