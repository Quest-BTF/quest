import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * The four houses and their defining traits.
 * Used in the system prompt to guide the AI's sorting decision.
 */
const HOUSES = {
  Innovators:
    'Creative problem-solvers who think big picture. They thrive on novel ideas, love experimenting, and are driven by curiosity and imagination.',
  Architects:
    'Systems thinkers who are detail-oriented and methodical. They excel at planning, structuring complex problems, and building robust solutions.',
  Operators:
    'Execution-focused individuals who are reliable and process-driven. They get things done, maintain consistency, and keep teams on track.',
  Mavericks:
    'Risk-takers and unconventional thinkers. They challenge the status quo, embrace chaos, and find opportunity where others see obstacles.',
};

/**
 * The behavioral questions asked on the waitlist form.
 * These are referenced by key (q1–q5) in the candidate's answers Map.
 */
export const QUESTIONS = {
  q1: 'Describe a project where you had to learn something completely new. How did you approach it?',
  q2: 'When working in a team, what role do you naturally take on?',
  q3: "How do you handle a situation where you disagree with your team's approach?",
  q4: "What's your approach to solving a problem you've never encountered before?",
  q5: 'Describe a time you failed at something. What did you do next?',
};

/**
 * Build the system prompt that instructs the AI on how to sort candidates.
 */
function buildSystemPrompt() {
  const houseDescriptions = Object.entries(HOUSES)
    .map(([name, desc]) => `- **${name}**: ${desc}`)
    .join('\n');

  return `You are the Sorting Hat for a tech community event. Your role is to evaluate candidates based on their behavioral answers and skills, then assign them to one of four houses.

## Houses
${houseDescriptions}

## Instructions
1. Carefully read the candidate's answers to the behavioral questions and their listed skills.
2. Evaluate which house best fits the candidate's personality, work style, and mindset.
3. Consider the overall pattern across ALL answers, not just one response.
4. Provide a thoughtful reasoning for your decision (2-3 sentences).

## Response Format
You MUST respond with valid JSON only. No markdown, no code fences, no extra text.
{
  "house": "<one of: Innovators, Architects, Operators, Mavericks>",
  "reasoning": "<your 2-3 sentence explanation>"
}`;
}

/**
 * Build the user prompt containing the candidate's data.
 */
function buildUserPrompt(candidateData) {
  const { name, skills, answers } = candidateData;

  const answersText = Object.entries(answers)
    .map(([key, answer]) => {
      const question = QUESTIONS[key] || key;
      return `**Q: ${question}**\nA: ${answer}`;
    })
    .join('\n\n');

  return `## Candidate: ${name}

### Skills
${skills.length > 0 ? skills.join(', ') : 'None listed'}

### Behavioral Answers
${answersText}`;
}

/**
 * Evaluate a candidate using the Groq API and return the sorting result.
 *
 * @param {Object} candidateData - { name, skills, answers }
 * @returns {Promise<{ house: string, reasoning: string }>}
 */
export async function evaluateCandidate(candidateData) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      'GROQ_API_KEY is not set. Please add it to your .env.local file.'
    );
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(),
        },
        {
          role: 'user',
          content: buildUserPrompt(candidateData),
        },
      ],
      temperature: 0.6,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Empty response from Groq API');
    }

    const result = JSON.parse(responseText);

    // Validate the response structure
    const validHouses = ['Innovators', 'Architects', 'Operators', 'Mavericks'];
    if (!validHouses.includes(result.house)) {
      throw new Error(
        `Invalid house "${result.house}" returned by AI. Expected one of: ${validHouses.join(', ')}`
      );
    }

    if (!result.reasoning || typeof result.reasoning !== 'string') {
      throw new Error('AI response missing reasoning field');
    }

    return {
      house: result.house,
      reasoning: result.reasoning,
    };
  } catch (error) {
    // If it's a JSON parse error, provide a clearer message
    if (error instanceof SyntaxError) {
      console.error('Failed to parse AI response as JSON:', error.message);
      throw new Error(
        'The AI returned an invalid response format. Please try again.'
      );
    }

    // Re-throw with context
    console.error('Groq evaluation error:', error.message);
    throw new Error(`AI evaluation failed: ${error.message}`);
  }
}
