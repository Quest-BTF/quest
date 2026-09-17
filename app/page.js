"use client";

import styles from "./landing.module.css";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Decorative floating orbs */}
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />
      <div className={`${styles.orb} ${styles.orb3}`} />
      <div className={`${styles.orb} ${styles.orb4}`} />

      <div className={styles.content}>
        {/* Quest Seal */}
        <div className={styles.seal}>
          <Image
            src="/images/questSeal.png"
            alt="Quest Seal"
            width={400}
            height={400}
            quality={100}
            priority
          />
        </div>

        {/* Eyebrow */}
        <p className={styles.eyebrow}>ByTheFew Presents</p>

        {/* Main Title */}
        <h1 className={styles.title}>QUEST I</h1>

        {/* Tagline */}
        <p className={styles.tagline}>
          One Goal. Thirty Days. Build in Public.
          <br />
          The builders who ship will be remembered.
        </p>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Description Card */}
        <div className={styles.descriptionCard}>
          <p className={styles.descriptionText}>
            A{" "}
            <span className={styles.descriptionHighlight}>
              30-day execution experience
            </span>{" "}
            for builders who are done consuming and ready to grow. You will be
            sorted into one of Four Great Houses, given Quests, and held
            accountable by your House and its Guardian.
          </p>
          <p className={styles.descriptionText}>
            This is not a course. It is a{" "}
            <span className={styles.descriptionHighlight}>proving ground</span>.
            Only the brave will remain.
          </p>
        </div>

        {/* Houses Teaser */}
        <div className={styles.housesTeaser}>
          <div className={styles.houseEmblem}>
            <div className={styles.houseDotAshmoor} />
            <span className={styles.houseName}>Ashmoor</span>
          </div>
          <div className={styles.houseEmblem}>
            <div className={styles.houseDotRavenscar} />
            <span className={styles.houseName}>Ravenscar</span>
          </div>
          <div className={styles.houseEmblem}>
            <div className={styles.houseDotValemont} />
            <span className={styles.houseName}>Valemont</span>
          </div>
          <div className={styles.houseEmblem}>
            <div className={styles.houseDotThornvale} />
            <span className={styles.houseName}>Thornvale</span>
          </div>
        </div>

        {/* CTA */}
        <div className={styles.ctaContainer}>
          <Link href="/form" className={styles.ctaButton}>
            Answer The Call
            <FaArrowRight className={styles.ctaIcon} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.attribution}>
        <p className={styles.attributionText}>
          Hosted by{" "}
          <a
            href="https://bythefew.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.attributionLink}
          >
            ByTheFew
          </a>
        </p>
      </footer>
    </div>
  );
}
