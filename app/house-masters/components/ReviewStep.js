"use client";
import styles from "../housemasters.module.css";
import { FaArrowLeft } from "react-icons/fa";
import { GiWaxSeal } from "react-icons/gi";
import { COUNCIL_QUESTIONS } from "../constants";

export default function ReviewStep({
  name,
  email,
  discord,
  motivation,
  hoursPerWeek,
  timezone,
  availableDays,
  councilAnswers,
  decidingAnswer,
  decidingReason,
  goBack,
  handleSubmit,
  canProceed,
  getCouncilAnswerText,
  getDecidingAnswerText,
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

        {/* Candidacy */}
        <div className={styles.reviewSection}>
          <p className={styles.reviewLabel}>Name</p>
          <p className={styles.reviewValue}>{name}</p>
        </div>

        <div className={styles.reviewSection}>
          <p className={styles.reviewLabel}>Email</p>
          <p className={styles.reviewValue}>{email}</p>
        </div>

        <div className={styles.reviewSection}>
          <p className={styles.reviewLabel}>Discord</p>
          <p className={styles.reviewValue}>{discord}</p>
        </div>

        <div className={styles.reviewSection}>
          <p className={styles.reviewLabel}>Leadership / Mentorship Experience</p>
          <p className={`${styles.reviewValue} ${styles.reviewQuote}`}>
            &ldquo;{motivation}&rdquo;
          </p>
        </div>

        {/* Commitment */}
        <div className={styles.reviewSection}>
          <p className={styles.reviewLabel}>Hours Per Week</p>
          <p className={styles.reviewValue}>{hoursPerWeek}</p>
        </div>

        <div className={styles.reviewSection}>
          <p className={styles.reviewLabel}>Timezone</p>
          <p className={styles.reviewValue}>{timezone}</p>
        </div>

        <div className={styles.reviewSection}>
          <p className={styles.reviewLabel}>Available Days</p>
          <p className={styles.reviewValue}>{availableDays.join(", ")}</p>
        </div>

        {/* Council Questions */}
        {COUNCIL_QUESTIONS.map((cq) => (
          <div key={cq.key} className={styles.reviewSection}>
            <p className={styles.reviewLabel}>{cq.label}</p>
            <p className={styles.reviewValue}>
              <strong>{councilAnswers[cq.key]}.</strong>{" "}
              {getCouncilAnswerText(cq.key, councilAnswers[cq.key])}
            </p>
          </div>
        ))}

        {/* Deciding Question */}
        <div className={styles.reviewSection}>
          <p className={styles.reviewLabel}>Core Value</p>
          <p className={styles.reviewValue}>
            <strong>{getDecidingAnswerText(decidingAnswer)}</strong>
          </p>
        </div>

        {decidingReason && (
          <div className={styles.reviewSection}>
            <p className={styles.reviewLabel}>Why That One?</p>
            <p className={`${styles.reviewValue} ${styles.reviewQuote}`}>
              &ldquo;{decidingReason}&rdquo;
            </p>
          </div>
        )}

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
