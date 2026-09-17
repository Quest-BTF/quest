"use client";
import styles from "../housemasters.module.css";
import Image from "next/image";
import { PREAMBLE_TEXT } from "../constants";

export default function PreambleStep({ goNext }) {
  return (
    <div className={styles.parchment}>
      <div className={styles.stepContent} key="step-1">
        <div className={styles.crestPlaceholder}>
          <Image
            src="/images/questSeal.png"
            alt="Quest Seal"
            width={400}
            height={400}
            quality={100}
          />
        </div>
        <p className={styles.preambleTitle}>A Summons From The Council</p>
        <h2 className={styles.preambleHeading}>
          A HOUSE STANDS WITHOUT ITS MASTER.
        </h2>

        <div className={styles.preambleText}>
          {PREAMBLE_TEXT.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        <p className={styles.preambleTitle}>
          Do you accept the responsibility?
        </p>
        <div
          className={styles.navContainer}
          style={{ justifyContent: "center" }}
        >
          <button
            className={styles.trapeziumButton}
            onClick={goNext}
            aria-label="Proceed to sorting"
            id="proceed-sorting-btn"
          >
            ACCEPT
          </button>
        </div>
      </div>
    </div>
  );
}
