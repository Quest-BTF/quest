import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * The four houses and their defining traits.
 * Used in the system prompt to guide the AI's tie-breaking and reasoning.
 */
const HOUSES = {
  Ashmoor:
    'Fearless, risk-tolerant, and disruptive trailblazers. Colors: Crimson & Gold. Motto: "Fortune favors the bold." They hate playing it safe and thrive on bold, aggressive action.',
  Ravenscar:
    'Analytical perfectionists driven by deep curiosity. Colors: Sapphire & Silver. Motto: "Knowledge guides creation." They obsess over details, architecture, and the "why" behind everything.',
  Valemont:
    'Resilient, consistent, and highly collaborative builders. Colors: Emerald & Silver. Motto: "Stand. Build. Endure." They build for the long term and prioritize sustainable, reliable systems.',
  Thornvale:
    'Strategic visionaries who see what others cannot. Colors: Royal Purple & Bronze. Motto: "See what others cannot." They spot angles, technologies, and opportunities invisible to everyone else.',
};

/**
 * The 5 scenario-based MCQ questions.
 * Each maps answer letters A–D to houses:
 *   A → Ashmoor, B → Ravenscar, C → Valemont, D → Thornvale
 */
export const QUESTIONS = {
  q1: 'A major product launch is two days away, and a critical feature just broke. What is your immediate reaction?',
  q2: 'When kicking off a brand-new project, where does your mind go first?',
  q3: 'You have to choose how to build or design the new product. Your preference is:',
  q4: 'A campaign, app, or product is truly successful if:',
  q5: 'A client or stakeholder says, "I don\'t like it. Make it pop more." You:',
};

/**
 * Full option text for each question, keyed by letter.
 */
export const OPTIONS = {
  q1: {
    A: 'Rally the team to take a calculated risk and confidently push through a bold, aggressive patch.',
    B: 'Isolate the system to methodically analyze the root cause, rewriting the underlying logic so the error is structurally eradicated.',
    C: 'Stand firm, absorb the pressure, and organize the team\'s workload to systematically resolve the issue without anyone burning out.',
    D: 'Look for an unseen angle—perhaps pivoting the "bug" into a temporary "feature"—while strategizing a next-gen update.',
  },
  q2: {
    A: 'Pitching a fearless, disruptive concept designed to shake up the industry.',
    B: 'Diving into research, data, and conceptual frameworks to ensure the creation is guided by deep knowledge.',
    C: 'Setting up a solid, resilient foundation and workflow so the team can build seamlessly without fear of collapse.',
    D: 'Identifying the hidden market gap or user need that all of your competitors completely missed.',
  },
  q3: {
    A: 'The bleeding-edge beta tool or framework—fortune favors those willing to leap first.',
    B: 'Crafting a bespoke solution from the ground up for ultimate precision.',
    C: 'A battle-tested, resilient stack that you know will endure heavy traffic and scale reliably.',
    D: 'Integrating forward-looking tools (like specialized LLMs or generative vision APIs) to give the product a futuristic edge.',
  },
  q4: {
    A: 'It takes a massive creative swing that forces the rest of the industry to play catch-up.',
    B: 'It wins acclaim for its pure technical wisdom, elegant architecture, and flawless design logic.',
    C: 'It scales reliably, endures market shifts over the years, and provides a stable, unbroken experience for users.',
    D: 'It captures a demographic or solves a complex problem nobody else even realized was there.',
  },
  q5: {
    A: 'Boldly defend the creative vision, demonstrating why a courageous, unconventional direction is the right choice.',
    B: 'Gather their feedback to refine your knowledge, returning with a meticulously researched and logically sound alternative.',
    C: 'Stand your ground patiently, working with them to build a resilient compromise that keeps the project moving forward.',
    D: 'Look past their literal words to see what they actually want, delivering a visionary pivot they didn\'t know they needed.',
  },
};

/**
 * Mapping from answer letter to house name.
 */
const LETTER_TO_HOUSE = {
  A: 'Ashmoor',
  B: 'Ravenscar',
  C: 'Valemont',
  D: 'Thornvale',
};

/**
 * Calculate the tally of answer letters and return a summary.
 * @param {Object} answers - { q1: 'A', q2: 'B', q3: 'A', q4: 'D', q5: 'C' }
 * @returns {{ tally: Object, leader: string|null, isTied: boolean }}
 */
function calculateTally(answers) {
  const tally = { A: 0, B: 0, C: 0, D: 0 };

  Object.values(answers).forEach((letter) => {
    const upper = letter?.toUpperCase();
    if (tally.hasOwnProperty(upper)) {
      tally[upper]++;
    }
  });

  const maxCount = Math.max(...Object.values(tally));
  const leaders = Object.entries(tally)
    .filter(([, count]) => count === maxCount)
    .map(([letter]) => letter);

  return {
    tally,
    leader: leaders.length === 1 ? leaders[0] : null,
    isTied: leaders.length > 1,
    tiedLetters: leaders,
  };
}

/**
 * Build the system prompt that instructs the AI on how to sort candidates.
 * The AI receives the tally and must respect it as primary input,
 * using reasoning to break ties when necessary.
 */
function buildSystemPrompt() {
  const houseDescriptions = Object.entries(HOUSES)
    .map(([name, desc]) => `- **${name}** (Letter ${Object.entries(LETTER_TO_HOUSE).find(([, h]) => h === name)?.[0]}): ${desc}`)
    .join('\n');

  return `You are the Sorting Hat for a cross-functional tech community. Your role is to assign candidates to one of four houses based on their questionnaire answers.

## Houses
${houseDescriptions}

## Sorting Rules
1. The candidate's 5 answers each map to a house: A → Ashmoor, B → Ravenscar, C → Valemont, D → Thornvale.
2. You will receive the letter tally (e.g., A:3, B:1, C:1, D:0).
3. **If one letter has a clear majority (3+ out of 5)**, you MUST assign the candidate to that house. Do not override.
4. **If there is a tie (e.g., 2:2:1 or 2:1:1:1)**, use your judgment based on the specific answers and skills to break the tie. Consider which house philosophy best matches the overall pattern of their responses.
5. In the "reasoning" field, write a 2-3 sentence personality assessment addressed to the candidate. Do NOT mention the house name — keep it a mystery. Describe their strengths and traits without revealing which house they belong to.

## Response Format
You MUST respond with valid JSON only. No markdown, no code fences, no extra text.
{
  "house": "<one of: Ashmoor, Ravenscar, Valemont, Thornvale>",
  "reasoning": "<a 2-3 sentence personality assessment that does NOT reveal the house name>"
}`;
}

/**
 * Build the user prompt containing the candidate's data and tally.
 */
function buildUserPrompt(candidateData, tallyResult) {
  const { name, skills, answers } = candidateData;

  const answersText = Object.entries(answers)
    .map(([key, letter]) => {
      const question = QUESTIONS[key] || key;
      const optionText = OPTIONS[key]?.[letter] || letter;
      return `**Q: ${question}**\nChose: **${letter}** — "${optionText}"`;
    })
    .join('\n\n');

  const tallyText = Object.entries(tallyResult.tally)
    .map(([letter, count]) => `${letter} (${LETTER_TO_HOUSE[letter]}): ${count}`)
    .join(', ');

  return `## Candidate: ${name}

### Skills
${skills.length > 0 ? skills.join(', ') : 'None listed'}

### Answer Tally
${tallyText}
${tallyResult.isTied ? `⚠️ TIE detected between: ${tallyResult.tiedLetters.map(l => LETTER_TO_HOUSE[l]).join(' & ')}. Use your judgment to break the tie.` : `✅ Clear leader: ${LETTER_TO_HOUSE[tallyResult.leader]} (${tallyResult.leader}: ${tallyResult.tally[tallyResult.leader]}/5)`}

### Individual Answers
${answersText}`;
}

/**
 * Evaluate a candidate using tally-based sorting + Groq AI for tie-breaking and reasoning.
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

  const tallyResult = calculateTally(candidateData.answers);

  try {
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(),
        },
        {
          role: 'user',
          content: buildUserPrompt(candidateData, tallyResult),
        },
      ],
      temperature: 0.5,
      max_tokens: 400,
    });

    let responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Empty response from Groq API');
    }

    // Clean up response — strip any stray tags or code fences just in case
    responseText = responseText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    let jsonStr = responseText;

    // Try to extract from code fences if present
    const fenceMatch = responseText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    } else {
      // Try to extract a raw JSON object from the text
      const jsonMatch = responseText.match(/\{[\s\S]*"house"[\s\S]*"reasoning"[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
    }

    const result = JSON.parse(jsonStr);

    // Validate the response structure
    const validHouses = ['Ashmoor', 'Ravenscar', 'Valemont', 'Thornvale'];
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
    // Fallback: if AI fails but we have a clear tally winner, use that
    if (tallyResult.leader) {
      console.error('Groq AI failed, falling back to tally result:', error.message);
      return {
        house: LETTER_TO_HOUSE[tallyResult.leader],
        reasoning: 'The Sorting Hat sensed a strong alignment in your answers. Your house awaits you.',
      };
    }

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

// ═══════════════════════════════════════════════════════════════════
// HOUSE MASTER EVALUATION
// ═══════════════════════════════════════════════════════════════════

/**
 * The house master leadership questions.
 */
export const HOUSE_MASTER_QUESTIONS = {
  q1: {
    title: 'What Can the Council Count On?',
    text: 'What strength can the council count on from you?',
    options: {
      A: 'Relentless drive and fearless decision-making',
      B: 'Deep analytical thinking and meticulous planning',
      C: 'Steady consistency and team-first collaboration',
      D: 'Visionary foresight and unconventional strategy',
    },
  },
  q2: {
    title: 'How You Lead',
    text: 'How you lead decides which house is yours.',
    options: {
      A: 'I lead from the front — by example and bold action',
      B: 'I lead with knowledge — through data, research, and precision',
      C: 'I lead by building trust — through reliability and endurance',
      D: 'I lead by seeing ahead — through vision and strategic innovation',
    },
  },
  q3: {
    title: 'Your Core Value',
    text: 'If you could drill one value into your house above all else...',
    options: {
      A: 'Courage — the willingness to take risks others won\'t',
      B: 'Wisdom — the pursuit of deep understanding and mastery',
      C: 'Resilience — the strength to endure and keep building',
      D: 'Vision — the ability to see opportunities others miss',
    },
  },
};

/**
 * Build the system prompt for house master evaluation.
 * Crucially, it includes the list of taken and available houses.
 */
function buildHouseMasterSystemPrompt(takenHouses) {
  const allHouses = ['Ashmoor', 'Ravenscar', 'Valemont', 'Thornvale'];
  const availableHouses = allHouses.filter((h) => !takenHouses.includes(h));

  const houseDescriptions = Object.entries(HOUSES)
    .map(([name, desc]) => {
      const status = takenHouses.includes(name) ? '🔒 TAKEN' : '✅ AVAILABLE';
      return `- **${name}** [${status}]: ${desc}`;
    })
    .join('\n');

  return `You are the Sorting Hat for a cross-functional tech community. Your role is to assign a HOUSE MASTER to lead one of the four houses.

## Houses
${houseDescriptions}

## CRITICAL ASSIGNMENT RULES
1. The following houses are ALREADY ASSIGNED and UNAVAILABLE: ${takenHouses.length > 0 ? takenHouses.join(', ') : 'None (all available)'}.
2. You MUST pick from the remaining AVAILABLE houses: ${availableHouses.join(', ')}.
3. Do NOT assign a taken house under ANY circumstances. This is the most important rule.
4. Each answer letter maps to a house preference: A → Ashmoor, B → Ravenscar, C → Valemont, D → Thornvale.
5. If the candidate's preferred house (based on answers) is taken, assign them to the BEST AVAILABLE alternative based on their motivation and answer patterns.
6. In the "reasoning" field, write a 2-3 sentence explanation addressed to the house master about why they were chosen for this house. You MAY mention the house name since this is revealed to house masters immediately.

## Response Format
You MUST respond with valid JSON only. No markdown, no code fences, no extra text.
{
  "house": "<one of the AVAILABLE houses: ${availableHouses.join(', ')}>",
  "reasoning": "<2-3 sentence explanation of why this house fits them>"
}`;
}

/**
 * Build the user prompt for a house master candidate.
 */
function buildHouseMasterUserPrompt(masterData, tallyResult) {
  const { name, motivation, answers } = masterData;

  const answersText = Object.entries(answers)
    .map(([key, letter]) => {
      const question = HOUSE_MASTER_QUESTIONS[key];
      const optionText = question?.options?.[letter] || letter;
      return `**Q: ${question?.text || key}**\nChose: **${letter}** — "${optionText}"`;
    })
    .join('\n\n');

  const tallyText = Object.entries(tallyResult.tally)
    .map(([letter, count]) => `${letter} (${LETTER_TO_HOUSE[letter]}): ${count}`)
    .join(', ');

  return `## House Master Candidate: ${name}

### Why They Want to Lead
"${motivation}"

### Answer Tally
${tallyText}

### Individual Answers
${answersText}`;
}

/**
 * Evaluate a house master using Groq AI, constrained to only available houses.
 *
 * @param {Object} masterData - { name, motivation, answers }
 * @param {string[]} takenHouses - Houses already assigned to other masters
 * @returns {Promise<{ house: string, reasoning: string }>}
 */
export async function evaluateHouseMaster(masterData, takenHouses = []) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      'GROQ_API_KEY is not set. Please add it to your .env.local file.'
    );
  }

  const allHouses = ['Ashmoor', 'Ravenscar', 'Valemont', 'Thornvale'];
  const availableHouses = allHouses.filter((h) => !takenHouses.includes(h));

  if (availableHouses.length === 0) {
    throw new Error('All houses have been assigned. No available houses remain.');
  }

  const tallyResult = calculateTally(masterData.answers);

  try {
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content: buildHouseMasterSystemPrompt(takenHouses),
        },
        {
          role: 'user',
          content: buildHouseMasterUserPrompt(masterData, tallyResult),
        },
      ],
      temperature: 0.4,
      max_tokens: 400,
    });

    let responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Empty response from Groq API');
    }

    // Clean up response
    responseText = responseText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    let jsonStr = responseText;

    const fenceMatch = responseText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    } else {
      const jsonMatch = responseText.match(/\{[\s\S]*"house"[\s\S]*"reasoning"[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
    }

    const result = JSON.parse(jsonStr);

    // Validate the assigned house is actually available
    if (!availableHouses.includes(result.house)) {
      // AI assigned a taken house — fall back to tally-based selection from available houses
      console.error(`AI assigned taken house "${result.house}", falling back to tally.`);

      const tallyPriority = ['A', 'B', 'C', 'D']
        .sort((a, b) => (tallyResult.tally[b] || 0) - (tallyResult.tally[a] || 0));

      let fallbackHouse = null;
      for (const letter of tallyPriority) {
        const house = LETTER_TO_HOUSE[letter];
        if (availableHouses.includes(house)) {
          fallbackHouse = house;
          break;
        }
      }

      if (!fallbackHouse) {
        fallbackHouse = availableHouses[0];
      }

      return {
        house: fallbackHouse,
        reasoning: result.reasoning || `The council has spoken. You have been chosen to lead ${fallbackHouse}.`,
      };
    }

    if (!result.reasoning || typeof result.reasoning !== 'string') {
      throw new Error('AI response missing reasoning field');
    }

    return {
      house: result.house,
      reasoning: result.reasoning,
    };
  } catch (error) {
    // Fallback: if AI fails, use tally to pick from available houses
    const tallyPriority = ['A', 'B', 'C', 'D']
      .sort((a, b) => (tallyResult.tally[b] || 0) - (tallyResult.tally[a] || 0));

    let fallbackHouse = null;
    for (const letter of tallyPriority) {
      const house = LETTER_TO_HOUSE[letter];
      if (availableHouses.includes(house)) {
        fallbackHouse = house;
        break;
      }
    }

    if (fallbackHouse) {
      console.error('Groq AI failed for house master, falling back to tally:', error.message);
      return {
        house: fallbackHouse,
        reasoning: `The council has deliberated. Your leadership qualities align with the spirit of ${fallbackHouse}. Welcome, House Master.`,
      };
    }

    console.error('House master evaluation failed:', error.message);
    throw new Error(`AI evaluation failed: ${error.message}`);
  }
}
