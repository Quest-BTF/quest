"use client";

import { useState, useRef } from "react";
import styles from "./page.module.css";
import { submitCandidate } from "./actions/submitCandidate";
import {
  FaCheck,
  FaArrowLeft,
  FaArrowRight,
  FaHatWizard,
} from "react-icons/fa";
import { IoWarningOutline, IoSparkles } from "react-icons/io5";

/**
 * The 5 scenario-based MCQ questions.
 * Each has 4 options (A/B/C/D) mapping to the four houses.
 */
const QUESTIONS = {
  q1: {
    title: "The 48-Hour Crisis",
    text: "A major product launch is two days away, and a critical feature just broke. What is your immediate reaction?",
    options: {
      A: "Rally the team to take a calculated risk and confidently push through a bold, aggressive patch.",
      B: "Isolate the system to methodically analyze the root cause, rewriting the underlying logic so the error is structurally eradicated.",
      C: "Stand firm, absorb the pressure, and organize the team\u2019s workload to systematically resolve the issue without anyone burning out.",
      D: 'Look for an unseen angle\u2014perhaps pivoting the \u201Cbug\u201D into a temporary \u201Cfeature\u201D\u2014while strategizing a next-gen update.',
    },
  },
  q2: {
    title: "The Blank Canvas",
    text: "When kicking off a brand-new project, where does your mind go first?",
    options: {
      A: "Pitching a fearless, disruptive concept designed to shake up the industry.",
      B: "Diving into research, data, and conceptual frameworks to ensure the creation is guided by deep knowledge.",
      C: "Setting up a solid, resilient foundation and workflow so the team can build seamlessly without fear of collapse.",
      D: "Identifying the hidden market gap or user need that all of your competitors completely missed.",
    },
  },
  q3: {
    title: "The Tech & Tool Stack",
    text: "You have to choose how to build or design the new product. Your preference is:",
    options: {
      A: "The bleeding-edge beta tool or framework\u2014fortune favors those willing to leap first.",
      B: "Crafting a bespoke solution from the ground up for ultimate precision.",
      C: "A battle-tested, resilient stack that you know will endure heavy traffic and scale reliably.",
      D: "Integrating forward-looking tools (like specialized LLMs or generative vision APIs) to give the product a futuristic edge.",
    },
  },
  q4: {
    title: "Defining a \u201CTriumph\u201D",
    text: "A campaign, app, or product is truly successful if:",
    options: {
      A: "It takes a massive creative swing that forces the rest of the industry to play catch-up.",
      B: "It wins acclaim for its pure technical wisdom, elegant architecture, and flawless design logic.",
      C: "It scales reliably, endures market shifts over the years, and provides a stable, unbroken experience for users.",
      D: "It captures a demographic or solves a complex problem nobody else even realized was there.",
    },
  },
  q5: {
    title: "Handling Rejection",
    text: 'A client or stakeholder says, "I don\u2019t like it. Make it pop more." You:',
    options: {
      A: "Boldly defend the creative vision, demonstrating why a courageous, unconventional direction is the right choice.",
      B: "Gather their feedback to refine your knowledge, returning with a meticulously researched and logically sound alternative.",
      C: "Stand your ground patiently, working with them to build a resilient compromise that keeps the project moving forward.",
      D: "Look past their literal words to see what they actually want, delivering a visionary pivot they didn\u2019t know they needed.",
    },
  },
};

const QUESTION_KEYS = ["q1", "q2", "q3", "q4", "q5"];

const STEPS = [
  { id: "info", label: "Info", questions: [] },
  { id: "q-1", label: "Q1\u2013Q3", questions: ["q1", "q2", "q3"] },
  { id: "q-2", label: "Q4\u2013Q5", questions: ["q4", "q5"] },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formState, setFormState] = useState("form"); // form | loading | result | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Form data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [answers, setAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
  });

  const skillInputRef = useRef(null);

  // ── Skills management ───────────────────────────────────────────
  function addSkill(value) {
    const trimmed = value.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 20) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  }

  function removeSkill(index) {
    setSkills(skills.filter((_, i) => i !== index));
  }

  function handleSkillKeyDown(e) {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      removeSkill(skills.length - 1);
    }
  }

  // ── Answer management ──────────────────────────────────────────
  function selectAnswer(questionKey, letter) {
    setAnswers((prev) => ({ ...prev, [questionKey]: letter }));
  }

  // ── Validation ─────────────────────────────────────────────────
  function canProceed() {
    if (currentStep === 0) {
      return (
        name.trim() &&
        email.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      );
    }
    const step = STEPS[currentStep];
    return step.questions.every((q) => answers[q]);
  }

  // ── Navigation ─────────────────────────────────────────────────
  function goNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  // ── Submit ─────────────────────────────────────────────────────
  async function handleSubmit() {
    setFormState("loading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("email", email.trim());
      formData.set("skills", skills.join(", "));

      Object.entries(answers).forEach(([key, value]) => {
        formData.set(`answer_${key}`, value);
      });

      const res = await submitCandidate(formData);

      if (res.success) {
        setResult(res);
        setFormState("result");
      } else {
        setErrorMsg(res.error || "Something went wrong.");
        setFormState("error");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setFormState("error");
    }
  }

  // ── Progress calculation ───────────────────────────────────────
  const progressPercent = (currentStep / (STEPS.length - 1)) * 100;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Decorative orbs */}
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />

      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.hatIcon}>
          <FaHatWizard />
        </span>
        <h1 className={styles.title}>
          <span className="gradient-text">The Sorting Hat</span>
        </h1>
        <p className={styles.subtitle}>
          Answer the call. Get sorted into your house and join an elite
          community of builders, strategists, and visionaries.
        </p>
      </header>

      {/* Progress bar (only during form state) */}
      {formState === "form" && (
        <div className={styles.progressContainer}>
          <div className={styles.progressSteps}>
            <div className={styles.progressLine}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {STEPS.map((step, i) => (
              <div
                key={step.id}
                className={`${styles.progressStep} ${
                  i === currentStep ? styles.progressStepActive : ""
                } ${i < currentStep ? styles.progressStepComplete : ""}`}
              >
                {i < currentStep ? <FaCheck size={12} /> : i + 1}
              </div>
            ))}
          </div>
          <div className={styles.progressLabels}>
            {STEPS.map((step, i) => (
              <span
                key={step.id}
                className={`${styles.progressLabel} ${
                  i <= currentStep ? styles.progressLabelActive : ""
                }`}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className={styles.formCard}>
        {/* ── Form Steps ──────────────────────────────────────── */}
        {formState === "form" && (
          <>
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
              <div className={styles.stepContainer} key="step-0">
                <h2 className={styles.stepTitle}>Tell us about yourself</h2>
                <p className={styles.stepDescription}>
                  We need a few details before the Sorting Hat can do its magic.
                </p>

                <div className={styles.fieldGroup}>
                  <label htmlFor="name" className={styles.fieldLabel}>
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={styles.fieldInput}
                    placeholder="e.g. Ada Lovelace"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="email" className={styles.fieldLabel}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={styles.fieldInput}
                    placeholder="ada@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Skills & Technologies
                  </label>
                  <div
                    className={styles.skillsWrapper}
                    onClick={() => skillInputRef.current?.focus()}
                  >
                    {skills.map((skill, i) => (
                      <span key={i} className={styles.skillTag}>
                        {skill}
                        <button
                          type="button"
                          className={styles.skillTagRemove}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSkill(i);
                          }}
                          aria-label={`Remove ${skill}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      ref={skillInputRef}
                      type="text"
                      className={styles.skillInput}
                      placeholder={
                        skills.length === 0
                          ? "Type a skill and press Enter..."
                          : "Add more..."
                      }
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      onBlur={() => {
                        if (skillInput.trim()) addSkill(skillInput);
                      }}
                    />
                  </div>
                  <p className={styles.skillHint}>
                    Press Enter or comma to add. e.g. React, Python, UI/UX
                  </p>
                </div>
              </div>
            )}

            {/* Step 2 & 3: Scenario Questions (MCQ) */}
            {currentStep > 0 && (
              <div className={styles.stepContainer} key={`step-${currentStep}`}>
                <h2 className={styles.stepTitle}>
                  {currentStep === 1
                    ? "The Hat speaks..."
                    : "Almost there..."}
                </h2>
                <p className={styles.stepDescription}>
                  {currentStep === 1
                    ? "Choose the response that resonates most with you."
                    : "Two final scenarios before the sorting ceremony."}
                </p>

                {STEPS[currentStep].questions.map((qKey, idx) => {
                  const question = QUESTIONS[qKey];
                  return (
                    <div key={qKey} className={styles.questionCard}>
                      <div className={styles.questionNumber}>
                        {question.title}
                      </div>
                      <div className={styles.questionText}>
                        {question.text}
                      </div>
                      <div className={styles.optionsGrid}>
                        {Object.entries(question.options).map(
                          ([letter, text]) => (
                            <div
                              key={letter}
                              className={`${styles.optionCard} ${
                                answers[qKey] === letter
                                  ? styles.optionSelected
                                  : ""
                              }`}
                              onClick={() => selectAnswer(qKey, letter)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  selectAnswer(qKey, letter);
                                }
                              }}
                            >
                              <span className={styles.optionLetter}>
                                {letter}
                              </span>
                              <span className={styles.optionText}>{text}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Navigation */}
            <div className={styles.formNav}>
              {currentStep > 0 ? (
                <button
                  type="button"
                  className={styles.navBack}
                  onClick={goBack}
                >
                  <FaArrowLeft size={12} /> Back
                </button>
              ) : (
                <span />
              )}

              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  className={styles.navNext}
                  onClick={goNext}
                  disabled={!canProceed()}
                >
                  Continue <FaArrowRight size={12} />
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.submitBtn}
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                >
                  <FaHatWizard size={16} /> Begin Sorting
                </button>
              )}
            </div>
          </>
        )}

        {/* ── Loading State ───────────────────────────────────── */}
        {formState === "loading" && (
          <div className={styles.loadingContainer}>
            <div className={styles.sortingAnimation}>
              <span className={styles.sortingHat}>
                <FaHatWizard size={56} />
              </span>
              <div className={styles.sparkles}>
                <span className={styles.sparkle} />
                <span className={styles.sparkle} />
                <span className={styles.sparkle} />
                <span className={styles.sparkle} />
              </div>
            </div>
            <h2 className={styles.loadingTitle}>
              <span className="gradient-text">The Hat is thinking...</span>
            </h2>
            <p className={styles.loadingSubtitle}>
              Evaluating your responses and finding the perfect house for you.
            </p>
          </div>
        )}

        {/* ── Result State ────────────────────────────────────── */}
        {formState === "result" && result && (
          <div className={styles.resultContainer}>
            <div className={styles.resultIcon}>
              <FaHatWizard size={56} />
            </div>
            <h2 className={styles.resultTitle}>
              <span className="gradient-text">The Hat has spoken!</span>
            </h2>
            <div
              className={styles.resultHouse}
              style={{ color: "var(--accent-gold)" }}
            >
              Your application has been seen
            </div>
            {result.reasoning && (
              <p className={styles.resultReasoning}>
                &ldquo;{result.reasoning}&rdquo;
              </p>
            )}
            <p className={styles.resultNote}>
              Your house will be revealed when you receive your official welcome
              email. Stay tuned!{" "}
              <IoSparkles style={{ verticalAlign: "middle" }} />
            </p>
          </div>
        )}

        {/* ── Error State ─────────────────────────────────────── */}
        {formState === "error" && (
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <IoWarningOutline size={48} />
            </div>
            <p className={styles.errorMessage}>{errorMsg}</p>
            <button
              type="button"
              className={styles.retryBtn}
              onClick={() => setFormState("form")}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
