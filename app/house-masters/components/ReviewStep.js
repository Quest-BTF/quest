"use client";
import styles from "../housemasters.module.css";
import { FaArrowLeft } from "react-icons/fa";
import { GiWaxSeal } from "react-icons/gi";

export default function ReviewStep({
  name,
  motivation,
  answers,
  QUESTIONS,
  QUESTION_KEYS,
  goBack,
  handleSubmit,
  canProceed,
  getAnswerText,
}) {
  return (
    <div className={styles.stepContent} key="step-6">
      <div className={styles.reviewContainer}>
        <p className={styles.questionLabel}>Final Review</p>
        <h2 className={styles.questionTitle}>
          Read It Back Before It&apos;s Sent to the Council...
        </h2>
        <p className={styles.questionSubtext}>
          Once submitted, your answers will be sealed and sent to the Council.
          There are no revisions.
        </p>

        <div className={styles.reviewSection}>
          <p className={styles.reviewLabel}>Name</p>
          <p className={styles.reviewValue}>{name}</p>
        </div>

        <div className={styles.reviewSection}>
          <p className={styles.reviewLabel}>Why You Want to Lead</p>
          <p className={`${styles.reviewValue} ${styles.reviewQuote}`}>
            &ldquo;{motivation}&rdquo;
          </p>
        </div>

        {QUESTION_KEYS.map((qKey) => (
          <div key={qKey} className={styles.reviewSection}>
            <p className={styles.reviewLabel}>{QUESTIONS[qKey].title}</p>
            <p className={styles.reviewValue}>
              <strong>{answers[qKey]}.</strong>{" "}
              {getAnswerText(qKey, answers[qKey])}
            </p>
          </div>
        ))}

        <p className={styles.reviewNote}>
          By submitting, you accept the Council&apos;s decision as final.
        </p>
      </div>

      <div className={styles.navContainer}>
        <button className={styles.navBack} onClick={goBack}>
          <FaArrowLeft size={10} /> Back
        </button>
        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={!canProceed()}
          id="submit-house-master-btn"
        >
          <GiWaxSeal /> Seal &amp; Submit
        </button>
      </div>
    </div>
  );
}
