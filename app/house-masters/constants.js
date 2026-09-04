/* ═══════════════════════════════════════════════════════════════════
   HOUSE MASTERS — Question Data & Constants
   ═══════════════════════════════════════════════════════════════════ */

// ── Step 3: The Commitment (form fields) ─────────────────────────
export const HOURS_OPTIONS = [
  "3–5 hours",
  "5–8 hours",
  "8–12 hours",
  "12+ hours",
];

export const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// ── Step 4: The Council's Questions (multi-sub-question MCQ) ─────
export const COUNCIL_QUESTIONS = [
  {
    key: "cq1",
    label:
      "A builder in your house stops shipping and goes quiet. Your first move is to...",
    options: {
      A: "Message them directly and hold them to the plan",
      B: "Challenge them publicly. A little heat gets people moving.",
      C: "Ask questions till you understand what actually broke.",
      D: "Show them the goal differently. Maybe the plan was wrong.",
    },
  },
  {
    key: "cq2",
    label: "The trait you respect most in a builder is...",
    options: {
      A: "They show up, grind it out, the work gets done.",
      B: "They ship before they're told. Totally.",
      C: "They think before they move and it shows.",
      D: "The moves they make that nobody sees coming.",
    },
  },
  {
    key: "cq3",
    label: "Under pressure, your own instinct is to...",
    options: {
      A: "Grind quietly till it's done.",
      B: "Rally the people around you and push forward together.",
      C: "Ask questions till you understand what actually broke.",
      D: "Step back, rethink, and find a smarter path.",
    },
  },
];

// ── Step 5: The Deciding Question (single-value picker) ──────────
export const DECIDING_QUESTION = {
  title: "If You Could Drill One Value Into Your House Above All Else...",
  subtitle: "This answer carries the most weight in the Council's decision.",
  labelPrefix: "THE DECIDING QUESTION",
  options: {
    A: "RESOLVE",
    B: "COURAGE",
    C: "WISDOM",
    D: "VISION",
  },
  followUp: {
    label: "WHY THAT ONE?",
    placeholder: "a sentence or two is plenty",
    key: "value_reason",
  },
};

/**
 * Total steps: 0=Landing, 1=Preamble, 2=Candidacy, 3=Commitment, 4=Council Questions, 5=Deciding, 6=Review
 */
export const TOTAL_PAGES = 7;

export const PREAMBLE_TEXT = `Yhe role does not fall to whoever asks for it. It falls to
the one who has already shown they can guide others
toward finished work - and your name reached the
Council's table on that evidence alone.

If you accept, you will stand at the head of a House for
the full thirty days: hosting its live sessions, keeping its
scoreboard honest, and being the one who notices
when a builder goes quiet. A short set of questions will
follow - your answers are how the Council decides
which House is yours to lead.`;
