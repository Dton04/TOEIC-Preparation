---
name: toeic-ai-prompts
description: >-
  Use this skill when developing, testing, or prompting AI features for TOEIC learning, such as automated question explanations, ETS trap diagnostics, bilingual passage translations, AI Tutor contextual chat, or vocabulary flashcard extraction.
---

# TOEIC AI Engineering & Prompt Design

This skill provides structured prompt templates, JSON schema definitions, and caching patterns for Generative AI features in the TOEIC platform.

---

## 1. System Prompt for Question Explanation & Trap Diagnostics

```markdown
You are an expert TOEIC Exam Specialist and English Linguistics Coach.
Analyze the provided TOEIC question and explain why the correct option is right and why the remaining options are incorrect.

Target Output Rules:
1. Return strictly valid JSON conforming to the schema below.
2. Identify common ETS traps (e.g., similar-sounding words, wrong tense, false cognates, adjective/adverb confusion).
3. Provide concise Vietnamese explanations tailored to learners targeting 500-750+.
4. Extract 2-4 high-frequency TOEIC vocabulary words with IPA and Vietnamese meaning.
```

### JSON Schema Output:
```json
{
  "type": "object",
  "properties": {
    "correctOption": { "type": "string", "enum": ["A", "B", "C", "D"] },
    "correctReason": { "type": "string", "description": "Lý do ngắn gọn, chuẩn xác vì sao đáp án này đúng" },
    "incorrectBreakdown": {
      "type": "object",
      "properties": {
        "A": { "type": "string", "description": "Lý do sai hoặc bẫy đề thi" },
        "B": { "type": "string" },
        "C": { "type": "string" },
        "D": { "type": "string" }
      }
    },
    "translatedText": { "type": "string", "description": "Dịch toàn bộ câu / đoạn sang tiếng Việt mượt mà" },
    "grammarRule": { "type": "string", "description": "Công thức ngữ pháp cốt lõi (nếu có)" },
    "vocabulary": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "word": { "type": "string" },
          "ipa": { "type": "string" },
          "partOfSpeech": { "type": "string" },
          "meaningVi": { "type": "string" }
        },
        "required": ["word", "meaningVi"]
      }
    }
  },
  "required": ["correctOption", "correctReason", "incorrectBreakdown", "translatedText"]
}
```

---

## 2. Context Injection for AI Tutor

When the student asks questions about a specific item in the test runner, construct the prompt with context:

```typescript
const promptContext = `
[QUESTION CONTEXT]
Part: ${partNumber}
Question Text: ${questionContent}
Options: ${JSON.stringify(options)}
${passageContext ? `Reading Passage: ${passageContext}` : ''}
${audioTranscript ? `Audio Transcript: ${audioTranscript}` : ''}
Student Selected: ${studentChoice}

[USER QUESTION]
${userQuery}
`;
```

---

## 3. Two-Tier Caching Flow
To minimize latency and LLM billing:
1. Compute Cache Key: `sha256(question_id)`.
2. Check Redis: `GET ai:explanation:{hash}` -> If present, return in `< 20ms`.
3. Check PostgreSQL `QuestionExplanation` -> If found, populate Redis and return.
4. If missing, invoke LLM worker via BullMQ, persist to DB and Redis, then return.
