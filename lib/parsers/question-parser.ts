export function parseCustomQuestions(payload: any): Record<string, string> | null {
  try {
    const questions = payload?.payload?.questions_and_answers;
    if (!Array.isArray(questions) || questions.length === 0) return null;

    const parsed: Record<string, string> = {};

    for (const q of questions) {
      // Skip if question or answer is missing
      if (!q.question || typeof q.question !== 'string') continue;

      // Normalize question to key
      const key = q.question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special chars
        .trim()
        .replace(/\s+/g, '_') // Spaces to underscores
        .substring(0, 50); // Max 50 chars

      // Skip if key is empty after normalization
      if (!key) continue;

      parsed[key] = q.answer || '';
    }

    return parsed;
  } catch (error) {
    console.error('Question parsing failed:', error);
    return null;
  }
}
