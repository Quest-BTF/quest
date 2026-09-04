"use client";
import styles from "../housemasters.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function CandidacyStep({
  name,
  setName,
  motivation,
  setMotivation,
  goNext,
  goBack,
  canProceed,
}) {
  return (
    <div className={styles.stepContent} key="step-2">
      <div className={styles.questionContainer}>
        <p className={styles.questionLabel}>The Candidacy</p>
        <h2 className={styles.questionTitle}>Tell Us Who&apos;s Accepting</h2>
        <p className={styles.questionSubtext}>
          State the Council your name and why you believe you are fit to lead a
          house of your peers.
        </p>

        <div className={styles.parchmentFieldGroup}>
          <label htmlFor="hm-name" className={styles.parchmentLabel}>
            Your Full Name
          </label>
          <input
            id="hm-name"
            type="text"
            className={styles.parchmentInput}
            placeholder="e.g. Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div className={styles.parchmentFieldGroup}>
          <label htmlFor="hm-motivation" className={styles.parchmentLabel}>
            Why Do You Want to Lead a House?
          </label>
          <textarea
            id="hm-motivation"
            className={styles.parchmentTextarea}
            placeholder="Tell the Council why you are stepping forward..."
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            rows={5}
          />
          <p className={styles.fieldHint}>Minimum 20 characters. Be genuine.</p>
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
          id="continue-btn-2"
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
}
