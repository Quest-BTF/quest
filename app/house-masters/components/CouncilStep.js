"use client";
import styles from "../housemasters.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { GiCrown } from "react-icons/gi";
import { COUNCIL_QUESTIONS } from "../constants";

export default function CouncilStep({
  councilAnswers,
  selectCouncilAnswer,
  goNext,
  goBack,
  canProceed,
}) {
  return (
    <div className={styles.stepContent} key="step-4">
      <div className={styles.questionContainer}>
        <div className={styles.candidacyCrest}>
          <GiCrown />
        </div>

        <div style={{ textAlign: "center" }}>
          <p className={styles.questionLabel}>The Council&apos;s Questions</p>
          <h2 className={styles.questionTitle}>
            How You Lead Decides Which House Is Yours.
          </h2>
          <p className={styles.questionSubtext}>
            Answer as the leader you actually are, not the one you&apos;d like
            to be.
          </p>
        </div>

        {COUNCIL_QUESTIONS.map((cq) => (
          <div key={cq.key} className={styles.subQuestionBlock}>
            <p className={styles.subQuestionLabel}>{cq.label}</p>
            <div className={styles.optionsGrid}>
              {Object.entries(cq.options).map(([letter, text]) => (
                <div
                  key={letter}
                  className={`${styles.optionCard} ${
                    councilAnswers[cq.key] === letter
                      ? styles.optionSelected
                      : ""
                  }`}
                  onClick={() => selectCouncilAnswer(cq.key, letter)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectCouncilAnswer(cq.key, letter);
                    }
                  }}
                >
                  <span className={styles.optionText}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
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
          id="continue-btn-4"
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
}
