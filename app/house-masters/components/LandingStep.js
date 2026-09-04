"use client";
import styles from "../housemasters.module.css";
import { GiCrown } from "react-icons/gi";

export default function LandingStep({ goNext }) {
  return (
    <div className={styles.scrollContainer}>
      <div className={styles.stepContent} key="step-0">
        <h1 className={styles.scrollHeading}>Office of the House Masters</h1>

        <div
          className={styles.crestPlaceholder}
          onClick={goNext}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              goNext();
            }
          }}
          aria-label="Begin ceremony"
          id="begin-ceremony-btn"
        >
          <GiCrown />
        </div>

        <p className={styles.scrollCta}>Break the seal to read your Summons</p>
      </div>
    </div>
  );
}
