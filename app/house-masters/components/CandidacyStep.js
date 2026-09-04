"use client";
import styles from "../housemasters.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { GiCrown } from "react-icons/gi";

export default function CandidacyStep({
  name,
  setName,
  email,
  setEmail,
  discord,
  setDiscord,
  motivation,
  setMotivation,
  goNext,
  goBack,
  canProceed,
}) {
  return (
    <div className={styles.stepContent} key="step-2">
      <div className={styles.questionContainer}>
        <div className={styles.candidacyCrest}>
          <GiCrown />
        </div>

        <div style={{ textAlign: "center" }}>
          <p className={styles.questionLabel}>Before the Council</p>
          <h2 className={styles.questionTitle}>
            Tell Us Who&apos;s Accepting.
          </h2>
          <p className={styles.questionSubtext}>
            This tells the Council how to reach you and what you bring to the
            role.
          </p>
        </div>

        <div className={styles.parchmentFieldGroup}>
          <label htmlFor="hm-name" className={styles.parchmentLabel}>
            Full Name
          </label>
          <input
            id="hm-name"
            type="text"
            className={styles.parchmentInput}
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div className={styles.parchmentFieldGroup}>
          <label htmlFor="hm-email" className={styles.parchmentLabel}>
            Email
          </label>
          <input
            id="hm-email"
            type="email"
            className={styles.parchmentInput}
            placeholder=""
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className={styles.parchmentFieldGroup}>
          <label htmlFor="hm-discord" className={styles.parchmentLabel}>
            Discord Username
          </label>
          <p className={styles.fieldHint}>
            So the Council can grant you Master permissions in the Academy
            server.
          </p>
          <input
            id="hm-discord"
            type="text"
            className={styles.parchmentInput}
            placeholder="e.g. AdaLovelace"
            value={discord}
            onChange={(e) => setDiscord(e.target.value)}
          />
        </div>

        <div className={styles.parchmentFieldGroup}>
          <label htmlFor="hm-motivation" className={styles.parchmentLabel}>
            What Leadership or Mentorship Experience Do You Bring?
          </label>
          <textarea
            id="hm-motivation"
            className={styles.parchmentTextarea}
            placeholder="Teams you've led, people you've mentored, communities you've run..."
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            rows={4}
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
          id="continue-btn-2"
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
}
