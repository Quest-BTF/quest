export const QUESTIONS = {
  q1: {
    title: "What Can the Council Count On?",
    subtitle:
      "What is the Council investing in when they hand you the keys to a house? What strength can the council count on from you?",
    labelPrefix: "THE COMMITMENT",
    options: {
      A: "Relentless drive and fearless decision-making",
      B: "Deep analytical thinking and meticulous planning",
      C: "Steady consistency and team-first collaboration",
      D: "Visionary foresight and unconventional strategy",
    },
    followUp: {
      label: "GIVE A STATEMENT OF NO MORE THAN TWO SENTENCES ON THIS",
      placeholder: "Briefly explain your choice...",
      key: "q1_statement",
    },
  },
  q2: {
    title: "How You Lead Decides Which House Is Yours.",
    subtitle:
      "When things get hard and your house looks to you, how do you lead?",
    labelPrefix: "THE PHILOSOPHY",
    options: {
      A: "I lead from the front — by example and bold action",
      B: "I lead with knowledge — through data, research, and precision",
      C: "I lead by building trust — through reliability and endurance",
      D: "I lead by seeing ahead — through vision and strategic innovation",
    },
    followUp: {
      label: "WHAT TRAIT DO YOU BELIEVE SEPARATES YOU AS A LEADER?",
      placeholder: "Describe your defining leadership trait...",
      key: "q2_trait",
    },
  },
  q3: {
    title: "If You Could Drill One Value Into Your House Above All Else...",
    subtitle:
      "Every great house is built on a single unshakeable belief. What's yours?",
    labelPrefix: "THE FOUNDATION",
    options: {
      A: "Courage — the willingness to take risks others won't",
      B: "Wisdom — the pursuit of deep understanding and mastery",
      C: "Resilience — the strength to endure and keep building",
      D: "Vision — the ability to see opportunities others miss",
    },
  },
};

export const QUESTION_KEYS = ["q1", "q2", "q3"];

/**
 * Total steps: 0=Landing, 1=Preamble, 2=Q1(name+why), 3=Q2, 4=Q3, 5=Q4, 6=Review
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
