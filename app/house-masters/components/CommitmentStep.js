"use client";
import styles from "../housemasters.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { GiCrown } from "react-icons/gi";
import { HOURS_OPTIONS, DAYS_OF_WEEK } from "../constants";

export default function CommitmentStep({
  hoursPerWeek,
  setHoursPerWeek,
  timezone,
  setTimezone,
  availableDays,
  setAvailableDays,
  goNext,
  goBack,
  canProceed,
}) {
  function toggleDay(day) {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  return (
    <div className={styles.stepContent} key="step-3">
      <div className={styles.questionContainer}>
        <div className={styles.candidacyCrest}>
          <GiCrown />
        </div>

        <div style={{ textAlign: "center" }}>
          <p className={styles.questionLabel}>The Commitment</p>
          <h2 className={styles.questionTitle}>
            What Can the Council Count On?
          </h2>
          <p className={styles.questionSubtext}>
            A House Master hosts three live sessions a week. We need to know
            when you&apos;re actually available.
          </p>
        </div>

        <div className={styles.parchmentFieldGroup}>
          <label htmlFor="hm-hours" className={styles.parchmentLabel}>
            Hours You Can Realistically Give Per Week
          </label>
          <select
            id="hm-hours"
            className={styles.parchmentSelect}
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
          >
            <option value="">Choose one</option>
            {HOURS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.parchmentFieldGroup}>
          <label htmlFor="hm-timezone" className={styles.parchmentLabel}>
            Your Timezone
          </label>
          <input
            id="hm-timezone"
            type="text"
            className={styles.parchmentInput}
            placeholder="e.g. WAT (GMT+1)"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          />
        </div>

        <div className={styles.parchmentFieldGroup}>
          <label className={styles.parchmentLabel}>
            Which Days Can You Reliably Host Live Sessions?
          </label>
          <div className={styles.dayChipsContainer}>
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                type="button"
                className={`${styles.dayChip} ${
                  availableDays.includes(day) ? styles.dayChipSelected : ""
                }`}
                onClick={() => toggleDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
          <p className={styles.fieldHint}>Choose at least 3 days</p>
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
          id="continue-btn-3"
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
}
