"use client";
import styles from "../housemasters.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { GiCrown } from "react-icons/gi";
import { DECIDING_QUESTION } from "../constants";

export default function DecidingStep({
  answer,
  selectAnswer,
  reason,
  setReason,
  goNext,
  goBack,
  canProceed,
}) {
  const q = DECIDING_QUESTION;

  return (
    <div className={styles.stepContent} key="step-5">
      <div className={styles.questionContainer}>
        <div className={styles.candidacyCrest}>
          <GiCrown />
        </div>

        <div style={{ textAlign: "center" }}>
          <p className={styles.questionLabel}>{q.labelPrefix}</p>
          <h2 className={styles.questionTitle}>{q.title}</h2>
          <p className={styles.questionSubtext}>{q.subtitle}</p>
        </div>

        <div className={styles.valueOptionsGrid}>
          {Object.entries(q.options).map(([letter, text]) => (
            <div
              key={letter}
              className={`${styles.valueOptionCard} ${
                answer === letter ? styles.valueOptionSelected : ""
              }`}
              onClick={() => selectAnswer(letter)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectAnswer(letter);
                }
              }}
            >
              <span className={styles.valueOptionText}>{text}</span>
            </div>
          ))}
        </div>

        <div
          className={styles.parchmentFieldGroup}
          style={{ marginTop: "var(--space-lg)" }}
        >
          <label className={styles.parchmentLabel}>{q.followUp.label}</label>
          <textarea
            className={styles.parchmentTextarea}
            placeholder={q.followUp.placeholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
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
          id="continue-btn-5"
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
}
