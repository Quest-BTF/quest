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
import CommitmentStep from "./components/CommitmentStep";
import CouncilStep from "./components/CouncilStep";
import DecidingStep from "./components/DecidingStep";
import ReviewStep from "./components/ReviewStep";
import { COUNCIL_QUESTIONS, DECIDING_QUESTION, TOTAL_PAGES } from "./constants";

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

  // Form data — Candidacy (step 2)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [discord, setDiscord] = useState("");
  const [motivation, setMotivation] = useState("");

  // Form data — Commitment (step 3)
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [timezone, setTimezone] = useState("");
  const [availableDays, setAvailableDays] = useState([]);

  // Form data — Council Questions (step 4)
  const [councilAnswers, setCouncilAnswers] = useState({
    cq1: "",
    cq2: "",
    cq3: "",
  });

  // Form data — Deciding Question (step 5)
  const [decidingAnswer, setDecidingAnswer] = useState("");
  const [decidingReason, setDecidingReason] = useState("");

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
  function selectCouncilAnswer(questionKey, letter) {
    setCouncilAnswers((prev) => ({ ...prev, [questionKey]: letter }));
  }

  // ── Validation ─────────────────────────────────────────────────
  function canProceed() {
    switch (currentStep) {
      case 0: // Landing — always can proceed
        return true;
      case 1: // Preamble — always can proceed
        return true;
      case 2: // Candidacy — name + email + discord + experience
        return (
          name.trim().length > 0 &&
          email.trim().length > 0 &&
          discord.trim().length > 0 &&
          motivation.trim().length > 0
        );
      case 3: // Commitment — hours + timezone + days
        return (
          hoursPerWeek !== "" &&
          timezone.trim().length > 0 &&
          availableDays.length >= 3
        );
      case 4: // Council Questions — all 3 sub-questions answered
        return (
          councilAnswers.cq1 !== "" &&
          councilAnswers.cq2 !== "" &&
          councilAnswers.cq3 !== ""
        );
      case 5: // Deciding Question — value selected
        return decidingAnswer !== "";
      case 6: // Review — everything filled
        return (
          name.trim() &&
          email.trim() &&
          discord.trim() &&
          motivation.trim() &&
          hoursPerWeek &&
          timezone.trim() &&
          availableDays.length >= 3 &&
          councilAnswers.cq1 &&
          councilAnswers.cq2 &&
          councilAnswers.cq3 &&
          decidingAnswer
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
      // Candidacy
      formData.set("name", name.trim());
      formData.set("email", email.trim());
      formData.set("discord", discord.trim());
      formData.set("motivation", motivation.trim());

      // Commitment
      formData.set("hours_per_week", hoursPerWeek);
      formData.set("timezone", timezone.trim());
      formData.set("available_days", availableDays.join(","));

      // Council Questions
      Object.entries(councilAnswers).forEach(([key, value]) => {
        formData.set(`answer_${key}`, value);
      });

      // Deciding Question
      formData.set("answer_deciding", decidingAnswer);
      formData.set("deciding_reason", decidingReason.trim());

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
        return "candidacy";
      case 3:
        return "commitment";
      case 4:
        return "questions";
      case 5:
        return "questions";
      case 6:
        return "review";
      default:
        return "";
    }
  }

  // ── Get option text for review ─────────────────────────────────
  function getCouncilAnswerText(cqKey, letter) {
    const cq = COUNCIL_QUESTIONS.find((q) => q.key === cqKey);
    return cq?.options?.[letter] || letter;
  }

  function getDecidingAnswerText(letter) {
    return DECIDING_QUESTION.options?.[letter] || letter;
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

            {/* Step 2: Candidacy */}
            {currentStep === 2 && (
              <CandidacyStep
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                discord={discord}
                setDiscord={setDiscord}
                motivation={motivation}
                setMotivation={setMotivation}
                goNext={goNext}
                goBack={goBack}
                canProceed={canProceed}
              />
            )}

            {/* Step 3: Commitment */}
            {currentStep === 3 && (
              <CommitmentStep
                hoursPerWeek={hoursPerWeek}
                setHoursPerWeek={setHoursPerWeek}
                timezone={timezone}
                setTimezone={setTimezone}
                availableDays={availableDays}
                setAvailableDays={setAvailableDays}
                goNext={goNext}
                goBack={goBack}
                canProceed={canProceed}
              />
            )}

            {/* Step 4: Council Questions */}
            {currentStep === 4 && (
              <CouncilStep
                councilAnswers={councilAnswers}
                selectCouncilAnswer={selectCouncilAnswer}
                goNext={goNext}
                goBack={goBack}
                canProceed={canProceed}
              />
            )}

            {/* Step 5: Deciding Question */}
            {currentStep === 5 && (
              <DecidingStep
                answer={decidingAnswer}
                selectAnswer={setDecidingAnswer}
                reason={decidingReason}
                setReason={setDecidingReason}
                goNext={goNext}
                goBack={goBack}
                canProceed={canProceed}
              />
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <ReviewStep
                name={name}
                email={email}
                discord={discord}
                motivation={motivation}
                hoursPerWeek={hoursPerWeek}
                timezone={timezone}
                availableDays={availableDays}
                councilAnswers={councilAnswers}
                decidingAnswer={decidingAnswer}
                decidingReason={decidingReason}
                goBack={goBack}
                handleSubmit={handleSubmit}
                canProceed={canProceed}
                getCouncilAnswerText={getCouncilAnswerText}
                getDecidingAnswerText={getDecidingAnswerText}
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
