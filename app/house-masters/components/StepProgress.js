"use client";
import styles from "../housemasters.module.css";
import Image from "next/image";

export default function StepProgress({ currentStep }) {
  // currentStep is 2, 3, 4, 5, 6
  // we want to map this to index 0, 1, 2, 3, 4
  const activeIndex = currentStep - 2;
  const totalSteps = 5;

  // Don't render for steps before candidacy (0, 1) or after review (e.g. results)
  if (currentStep < 2 || currentStep > 6) return null;

  return (
    <div className={styles.stepProgressWrapper}>
      <div className={styles.crestPlaceholder}>
        <Image
          src="/images/questSeal.png"
          alt="Quest Seal"
          width={400}
          height={400}
          quality={100}
        />
      </div>
      
      <div className={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`${styles.progressDot} ${
              index === activeIndex ? styles.active : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
