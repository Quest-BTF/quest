"use client";

import { useState, useEffect } from "react";
import styles from "./housemasters.module.css";
import { submitHouseMaster } from "../actions/submitHouseMaster";
import { getHouseMasters } from "../actions/getHouseMasters";
import { IoWarningOutline } from "react-icons/io5";
import {
  GiSwordBrandish,
  GiOpenBook,
  GiOakLeaf,
  GiCrystalBall,
  GiScrollUnfurled,
  GiCrown,
} from "react-icons/gi";
import { HiOutlineLockClosed } from "react-icons/hi";

// Import extracted components and constants
import LandingStep from "./components/LandingStep";
import PreambleStep from "./components/PreambleStep";
import CandidacyStep from "./components/CandidacyStep";
import QuestionStep from "./components/QuestionStep";
import ReviewStep from "./components/ReviewStep";
import { QUESTIONS, QUESTION_KEYS, TOTAL_PAGES } from "./constants";

const HOUSE_ICONS = {
  Ashmoor: <GiSwordBrandish />,
  Ravenscar: <GiOpenBook />,
  Valemont: <GiOakLeaf />,
  Thornvale: <GiCrystalBall />,
};

export default function HouseMastersPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formState, setFormState] = useState("loading"); // loading | form | submitting | result | error | full
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [availableCount, setAvailableCount] = useState(4);

  // Form data
  const [name, setName] = useState("");
  const [motivation, setMotivation] = useState("");
  const [answers, setAnswers] = useState({ q1: "", q2: "", q3: "" });
  const [statements, setStatements] = useState({
    q1_statement: "",
    q2_trait: "",
  });

  // ── Check availability on mount ────────────────────────────────
  useEffect(() => {
    async function checkAvailability() {
      try {
        const res = await getHouseMasters();
        if (res.success) {
          if (res.availableCount <= 0) {
            setFormState("full");
          } else {
            setAvailableCount(res.availableCount);
            setFormState("form");
          }
        } else {
          setFormState("form");
        }
      } catch {
        setFormState("form");
      }
    }
    checkAvailability();
  }, []);

  // ── Answer management ──────────────────────────────────────────
  function selectAnswer(questionKey, letter) {
    setAnswers((prev) => ({ ...prev, [questionKey]: letter }));
  }

  function updateStatement(key, value) {
    setStatements((prev) => ({ ...prev, [key]: value }));
  }

  // ── Validation ─────────────────────────────────────────────────
  function canProceed() {
    switch (currentStep) {
      case 0: // Landing — always can proceed
        return true;
      case 1: // Preamble — always can proceed
        return true;
      case 2: // Name + motivation
        return name.trim().length > 0 && motivation.trim().length >= 20;
      case 3: // Q1
        return answers.q1 !== "";
      case 4: // Q2
        return answers.q2 !== "";
      case 5: // Q3
        return answers.q3 !== "";
      case 6: // Review — all must be filled
        return (
          name.trim() &&
          motivation.trim().length >= 20 &&
          answers.q1 &&
          answers.q2 &&
          answers.q3
        );
      default:
        return false;
    }
  }

  // ── Navigation ─────────────────────────────────────────────────
  function goNext() {
    if (currentStep < TOTAL_PAGES - 1) {
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
    setFormState("submitting");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("motivation", motivation.trim());

      Object.entries(answers).forEach(([key, value]) => {
        formData.set(`answer_${key}`, value);
      });

      const res = await submitHouseMaster(formData);

      if (res.success) {
        setResult(res);
        setFormState("result");
      } else {
        setErrorMsg(res.error || "Something went wrong.");
        setFormState("error");
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setFormState("error");
    }
  }

  // ── Page label ─────────────────────────────────────────────────
  function getPageLabel() {
    if (currentStep === 0) return null;
    return `PAGE ${currentStep} OF ${TOTAL_PAGES - 1}`;
  }

  function getPageTitle() {
    switch (currentStep) {
      case 0:
        return "the quest (house masters)";
      case 1:
        return "the quest (house masters)";
      case 2:
        return "questions";
      case 3:
        return "questions";
      case 4:
        return "questions";
      case 5:
        return "questions";
      case 6:
        return "questions";
      default:
        return "";
    }
  }

  // ── Get option text for review ─────────────────────────────────
  function getAnswerText(qKey, letter) {
    return QUESTIONS[qKey]?.options?.[letter] || letter;
  }

  // ── Render ─────────────────────────────────────────────────────
  // Loading check
  if (formState === "loading") {
    return (
      <div className={styles.page}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
        <div className={styles.parchmentCard}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingIcon}>
              <GiScrollUnfurled />
            </div>
            <p className={styles.loadingTitle}>Consulting the Council...</p>
            <div className={styles.loadingDots}>
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // All houses taken
  if (formState === "full") {
    return (
      <div className={styles.page}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
        <div className={styles.parchmentCard}>
          <div className={styles.fullContainer}>
            <div className={styles.fullIcon}>
              <HiOutlineLockClosed />
            </div>
            <h2 className={styles.fullTitle}>The Council Is Complete</h2>
            <p className={styles.fullSubtext}>
              All four houses have been claimed by their masters. The sorting
              ceremony for house masters has concluded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Decorative orbs */}
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />

      {/* Progress Header */}
      {formState === "form" && currentStep > 0 && (
        <div className={styles.progressHeader}>
          <span className={styles.progressTitle}>{getPageTitle()}</span>
          <span className={styles.progressLabel}>{getPageLabel()}</span>
        </div>
      )}

      {/* Step 0: Landing / Scroll */}
      {formState === "form" && currentStep === 0 && (
        <LandingStep goNext={goNext} />
      )}

      {/* Step 1: Preamble */}
      {formState === "form" && currentStep === 1 && (
        <PreambleStep goNext={goNext} />
      )}

      {/* Parchment Card — for all steps except preamble and landing */}
      {!(formState === "form" && (currentStep === 0 || currentStep === 1)) && (
      <div className={styles.parchmentCard}>
        {/* ── FORM STEPS ──────────────────────────────────────── */}
        {formState === "form" && (
          <>

            {/* Step 2: Name + Motivation */}
            {currentStep === 2 && (
              <CandidacyStep
                name={name}
                setName={setName}
                motivation={motivation}
                setMotivation={setMotivation}
                goNext={goNext}
                goBack={goBack}
                canProceed={canProceed}
              />
            )}

            {/* Steps 3–5: MCQ Questions */}
            {currentStep >= 3 && currentStep <= 5 && (
              <QuestionStep
                currentStep={currentStep}
                questionKey={QUESTION_KEYS[currentStep - 3]}
                question={QUESTIONS[QUESTION_KEYS[currentStep - 3]]}
                answer={answers[QUESTION_KEYS[currentStep - 3]]}
                selectAnswer={selectAnswer}
                statement={statements[QUESTIONS[QUESTION_KEYS[currentStep - 3]].followUp?.key]}
                updateStatement={updateStatement}
                goNext={goNext}
                goBack={goBack}
                canProceed={canProceed}
              />
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <ReviewStep
                name={name}
                motivation={motivation}
                answers={answers}
                QUESTIONS={QUESTIONS}
                QUESTION_KEYS={QUESTION_KEYS}
                goBack={goBack}
                handleSubmit={handleSubmit}
                canProceed={canProceed}
                getAnswerText={getAnswerText}
              />
            )}
          </>
        )}

        {/* ── SUBMITTING STATE ────────────────────────────────── */}
        {formState === "submitting" && (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingIcon}>
              <GiScrollUnfurled />
            </div>
            <h2 className={styles.loadingTitle}>
              The Council is deliberating...
            </h2>
            <p className={styles.loadingSubtitle}>
              Your answers are being reviewed. A house will be assigned
              shortly.
            </p>
            <div className={styles.loadingDots}>
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
            </div>
          </div>
        )}

        {/* ── RESULT STATE ────────────────────────────────────── */}
        {formState === "result" && result && (
          <div className={styles.resultContainer}>
            <div className={styles.resultIconContainer}>
              <div
                className={
                  styles[`resultIcon${result.house}`] || styles.resultIcon
                }
              >
                {HOUSE_ICONS[result.house] || <GiCrown />}
              </div>
            </div>

            <p className={styles.resultPreTitle}>The Council Has Spoken</p>
            <h2 className={styles.resultTitle}>Welcome, House Master.</h2>

            <div
              className={`${styles.resultHouse} ${
                styles[`house${result.house}`] || ""
              }`}
            >
              {result.house}
            </div>

            {result.reasoning && (
              <p className={styles.resultReasoning}>
                &ldquo;{result.reasoning}&rdquo;
              </p>
            )}

            <p className={styles.resultNote}>
              Your assignment is final. You will receive further instructions
              from the Council.
            </p>
          </div>
        )}

        {/* ── ERROR STATE ─────────────────────────────────────── */}
        {formState === "error" && (
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <IoWarningOutline />
            </div>
            <p className={styles.errorMessage}>{errorMsg}</p>
            <button
              className={styles.retryButton}
              onClick={() => setFormState("form")}
              id="retry-btn"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
