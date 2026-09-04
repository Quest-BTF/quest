"use client";
import styles from "../housemasters.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function QuestionStep({
  currentStep,
  questionKey,
  question,
  answer,
  selectAnswer,
  statement,
  updateStatement,
  goNext,
  goBack,
  canProceed,
}) {
  return (
    <div className={styles.stepContent} key={`step-${currentStep}`}>
      <div className={styles.questionContainer}>
        <p className={styles.questionLabel}>{question.labelPrefix}</p>
        <h2 className={styles.questionTitle}>{question.title}</h2>
        <p className={styles.questionSubtext}>{question.subtitle}</p>

        <div className={styles.optionsGrid}>
          {Object.entries(question.options).map(([letter, text]) => (
            <div
              key={letter}
              className={`${styles.optionCard} ${
                answer === letter ? styles.optionSelected : ""
              }`}
              onClick={() => selectAnswer(questionKey, letter)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectAnswer(questionKey, letter);
                }
              }}
            >
              <span className={styles.optionLetter}>{letter}</span>
              <span className={styles.optionText}>{text}</span>
            </div>
          ))}
        </div>

        {/* Optional follow-up text field */}
        {question.followUp && (
          <div
            className={styles.parchmentFieldGroup}
            style={{ marginTop: "var(--space-lg)" }}
          >
            <label className={styles.parchmentLabel}>
              {question.followUp.label}
            </label>
            <textarea
              className={styles.parchmentTextarea}
              placeholder={question.followUp.placeholder}
              value={statement || ""}
              onChange={(e) => updateStatement(question.followUp.key, e.target.value)}
              rows={3}
            />
          </div>
        )}
      </div>

      <div className={styles.navContainer}>
        <button className={styles.navBack} onClick={goBack}>
          <FaArrowLeft size={10} /> Back
        </button>
        <button
          className={styles.sealButton}
          onClick={goNext}
          disabled={!canProceed()}
          aria-label="Continue"
          id={`continue-btn-${currentStep}`}
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
}
