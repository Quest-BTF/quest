'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './admin.module.css';
import { getCandidates } from '../actions/getCandidates';
import { updateCandidate } from '../actions/updateCandidate';
import { dispatchEmails } from '../actions/dispatchEmails';
import { FaHatWizard, FaCheck, FaTimes } from 'react-icons/fa';
import { FiRefreshCw, FiSend } from 'react-icons/fi';
import { HiOutlineClock } from 'react-icons/hi';
import { GoLock } from 'react-icons/go';
import { RiRobot2Line, RiHome4Line } from 'react-icons/ri';
import { AiOutlineTool } from 'react-icons/ai';
import { MdOutlineCheckCircle, MdOutlineCancel } from 'react-icons/md';
import { GiSwordBrandish, GiOpenBook, GiOakLeaf, GiCrystalBall } from 'react-icons/gi';

/**
 * Question titles for the expanded detail view.
 */
const QUESTIONS = {
  q1: 'The 48-Hour Crisis',
  q2: 'The Blank Canvas',
  q3: 'The Tech & Tool Stack',
  q4: 'Defining a "Triumph"',
  q5: 'Handling Rejection',
};

/**
 * Answer letter to house mapping (for display in detail view).
 */
const LETTER_TO_HOUSE = {
  A: 'Ashmoor',
  B: 'Ravenscar',
  C: 'Valemont',
  D: 'Thornvale',
};

const HOUSE_ICONS = {
  Ashmoor: <GiSwordBrandish />,
  Ravenscar: <GiOpenBook />,
  Valemont: <GiOakLeaf />,
  Thornvale: <GiCrystalBall />,
};

const ADMIN_SECRET = 'HARRY_POTTER';

export default function AdminDashboard() {
  // ── Auth State ─────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // ── Data State ─────────────────────────────────────────────────
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // ── Filters ────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [houseFilter, setHouseFilter] = useState('all');

  // ── Toast ──────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const [dispatching, setDispatching] = useState(false);

  // ── Auth ───────────────────────────────────────────────────────
  function handleLogin(e) {
    e.preventDefault();
    if (password === ADMIN_SECRET) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid password. Try again.');
    }
  }

  // ── Toast helper ───────────────────────────────────────────────
  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  // ── Fetch candidates ──────────────────────────────────────────
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    const res = await getCandidates({
      status: statusFilter,
      house: houseFilter,
      search: search,
    });
    if (res.success) {
      setCandidates(res.candidates);
    } else {
      showToast(res.error || 'Failed to load candidates.', 'error');
    }
    setLoading(false);
  }, [statusFilter, houseFilter, search]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCandidates();
    }
  }, [isAuthenticated, fetchCandidates]);

  // ── Debounced search ──────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Update candidate ──────────────────────────────────────────
  async function handleUpdateCandidate(id, updates) {
    const res = await updateCandidate(id, updates);
    if (res.success) {
      setCandidates((prev) =>
        prev.map((c) => (c._id === id ? res.candidate : c))
      );
      const action = updates.status || `House → ${updates.house}`;
      showToast(`Candidate updated: ${action}`);
    } else {
      showToast(res.error || 'Update failed.', 'error');
    }
  }

  // ── Dispatch emails ───────────────────────────────────────────
  async function handleDispatchEmails() {
    if (dispatching) return;

    const approvedCount = candidates.filter(
      (c) => c.status === 'Approved' && !c.emailSent
    ).length;

    if (approvedCount === 0) {
      showToast('No approved candidates with pending emails.', 'info');
      return;
    }

    if (
      !window.confirm(
        `Send welcome emails to ${approvedCount} approved candidate(s)?`
      )
    ) {
      return;
    }

    setDispatching(true);
    const res = await dispatchEmails();

    if (res.success) {
      showToast(res.message, res.failed > 0 ? 'error' : 'success');
      fetchCandidates(); // Refresh to update emailSent status
    } else {
      showToast(res.message || 'Dispatch failed.', 'error');
    }
    setDispatching(false);
  }

  // ── Stats ──────────────────────────────────────────────────────
  const stats = {
    total: candidates.length,
    ashmoor: candidates.filter((c) => c.house === 'Ashmoor').length,
    ravenscar: candidates.filter((c) => c.house === 'Ravenscar').length,
    valemont: candidates.filter((c) => c.house === 'Valemont').length,
    thornvale: candidates.filter((c) => c.house === 'Thornvale').length,
    approved: candidates.filter((c) => c.status === 'Approved').length,
    eliminated: candidates.filter((c) => c.status === 'Eliminated').length,
  };

  // ── Format date ────────────────────────────────────────────────
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  // ── Login Gate ─────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer}>
        <form className={styles.loginCard} onSubmit={handleLogin}>
          <span className={styles.loginIcon}><GoLock size={40} /></span>
          <h1 className={styles.loginTitle}>Admin Access</h1>
          <p className={styles.loginSubtitle}>
            Enter the secret passphrase to continue.
          </p>
          <input
            type="password"
            className={styles.loginInput}
            placeholder="Enter passphrase..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button type="submit" className={styles.loginBtn}>
            Unlock Dashboard
          </button>
          {authError && <p className={styles.loginError}>{authError}</p>}
        </form>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}><FaHatWizard size={32} /></span>
          <div>
            <h1 className={styles.headerTitle}>Sorting Hat Admin</h1>
            <p className={styles.headerSubtitle}>
              Manage candidates, override houses, dispatch emails
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.refreshBtn}
            onClick={fetchCandidates}
            disabled={loading}
          >
            <FiRefreshCw size={14} /> Refresh
          </button>
          <button
            className={styles.dispatchBtn}
            onClick={handleDispatchEmails}
            disabled={dispatching}
          >
            {dispatching ? (
              <><HiOutlineClock size={14} /> Sending...</>
            ) : (
              <><FiSend size={14} /> Dispatch Emails</>
            )}
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={`${styles.statCard} ${styles.statTotal}`}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total</div>
        </div>
        <div className={`${styles.statCard} ${styles.statAshmoor}`}>
          <div className={styles.statValue}>{stats.ashmoor}</div>
          <div className={styles.statLabel}><GiSwordBrandish /> Ashmoor</div>
        </div>
        <div className={`${styles.statCard} ${styles.statRavenscar}`}>
          <div className={styles.statValue}>{stats.ravenscar}</div>
          <div className={styles.statLabel}><GiOpenBook /> Ravenscar</div>
        </div>
        <div className={`${styles.statCard} ${styles.statValemont}`}>
          <div className={styles.statValue}>{stats.valemont}</div>
          <div className={styles.statLabel}><GiOakLeaf /> Valemont</div>
        </div>
        <div className={`${styles.statCard} ${styles.statThornvale}`}>
          <div className={styles.statValue}>{stats.thornvale}</div>
          <div className={styles.statLabel}><GiCrystalBall /> Thornvale</div>
        </div>
        <div className={`${styles.statCard} ${styles.statApproved}`}>
          <div className={styles.statValue}>{stats.approved}</div>
          <div className={styles.statLabel}><MdOutlineCheckCircle /> Approved</div>
        </div>
        <div className={`${styles.statCard} ${styles.statEliminated}`}>
          <div className={styles.statValue}>{stats.eliminated}</div>
          <div className={styles.statLabel}><MdOutlineCancel /> Eliminated</div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="Unsorted">Unsorted</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Approved">Approved</option>
          <option value="Eliminated">Eliminated</option>
        </select>
        <select
          className={styles.filterSelect}
          value={houseFilter}
          onChange={(e) => setHouseFilter(e.target.value)}
        >
          <option value="all">All Houses</option>
          <option value="Ashmoor">Ashmoor</option>
          <option value="Ravenscar">Ravenscar</option>
          <option value="Valemont">Valemont</option>
          <option value="Thornvale">Thornvale</option>
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
          </div>
        ) : candidates.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><FaHatWizard size={48} /></div>
            <p className={styles.emptyText}>No candidates found</p>
            <p className={styles.emptySubtext}>
              Candidates will appear here once they submit the waitlist form.
            </p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>House</th>
                <th>Status</th>
                <th>Email</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <>
                  {/* Main Row */}
                  <tr
                    key={candidate._id}
                    onClick={() =>
                      setExpandedId(
                        expandedId === candidate._id ? null : candidate._id
                      )
                    }
                  >
                    <td>
                      <div className={styles.candidateName}>
                        {candidate.name}
                      </div>
                      <div className={styles.candidateEmail}>
                        {candidate.email}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.houseBadge} ${
                          candidate.house
                            ? styles[`house${candidate.house}`]
                            : styles.houseNone
                        }`}
                      >
                        {candidate.house
                          ? <>{HOUSE_ICONS[candidate.house]} {candidate.house}</>
                          : 'Unsorted'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[
                            `status${candidate.status.replace(/\s/g, '')}`
                          ] || ''
                        }`}
                      >
                        {candidate.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.emailSentBadge} ${
                          candidate.emailSent
                            ? styles.emailSent
                            : styles.emailNotSent
                        }`}
                      >
                        {candidate.emailSent ? (
                          <><MdOutlineCheckCircle /> Sent</>
                        ) : (
                          <><HiOutlineClock /> Pending</>
                        )}
                      </span>
                    </td>
                    <td className={styles.candidateDate}>
                      {formatDate(candidate.createdAt)}
                    </td>
                    <td>
                      <div
                        className={styles.actionBtns}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {candidate.status !== 'Approved' && (
                          <button
                            className={`${styles.actionBtn} ${styles.approveBtn}`}
                            onClick={() =>
                              handleUpdateCandidate(candidate._id, {
                                status: 'Approved',
                              })
                            }
                          >
                            <FaCheck size={10} /> Approve
                          </button>
                        )}
                        {candidate.status !== 'Eliminated' && (
                          <button
                            className={`${styles.actionBtn} ${styles.eliminateBtn}`}
                            onClick={() =>
                              handleUpdateCandidate(candidate._id, {
                                status: 'Eliminated',
                              })
                            }
                          >
                            <FaTimes size={10} /> Eliminate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {expandedId === candidate._id && (
                    <tr
                      key={`${candidate._id}-detail`}
                      className={styles.detailPanel}
                    >
                      <td colSpan={6}>
                        <div className={styles.detailContent}>
                          <div className={styles.detailGrid}>
                            {/* Left: Answers */}
                            <div className={styles.detailAnswers}>
                              {Object.entries(candidate.answers || {}).map(
                                ([key, answer]) => (
                                  <div key={key}>
                                    <div className={styles.detailQuestion}>
                                      {QUESTIONS[key] || key}
                                    </div>
                                    <div className={styles.detailAnswer}>
                                      Chose: <strong>{answer}</strong> → {LETTER_TO_HOUSE[answer] || answer}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>

                            {/* Right: Sidebar */}
                            <div className={styles.detailSidebar}>
                              {/* AI Reasoning */}
                              {candidate.aiReasoning && (
                                <div className={styles.detailSection}>
                                  <div className={styles.detailSectionTitle}>
                                    <RiRobot2Line /> AI Reasoning
                                  </div>
                                  <p className={styles.aiReasoning}>
                                    &ldquo;{candidate.aiReasoning}&rdquo;
                                  </p>
                                </div>
                              )}

                              {/* House Override */}
                              <div className={styles.detailSection}>
                                <div className={styles.detailSectionTitle}>
                                  <RiHome4Line /> Override House
                                </div>
                                <select
                                  className={styles.houseSelect}
                                  value={candidate.house || ''}
                                  onChange={(e) =>
                                    handleUpdateCandidate(candidate._id, {
                                      house: e.target.value || null,
                                    })
                                  }
                                >
                                  <option value="">— Unsorted —</option>
                                  <option value="Ashmoor">Ashmoor</option>
                                  <option value="Ravenscar">Ravenscar</option>
                                  <option value="Valemont">Valemont</option>
                                  <option value="Thornvale">Thornvale</option>
                                </select>
                              </div>

                              {/* Skills */}
                              {candidate.skills &&
                                candidate.skills.length > 0 && (
                                  <div className={styles.detailSection}>
                                    <div className={styles.detailSectionTitle}>
                                      <AiOutlineTool /> Skills
                                    </div>
                                    <div className={styles.skillsList}>
                                      {candidate.skills.map((skill, i) => (
                                        <span
                                          key={i}
                                          className={styles.skillPill}
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`${styles.toast} ${
            toast.type === 'error'
              ? styles.toastError
              : toast.type === 'info'
                ? styles.toastInfo
                : styles.toastSuccess
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
