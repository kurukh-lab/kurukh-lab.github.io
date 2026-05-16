import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    orderBy,
    getDoc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../config/firebase";
import { formatDate } from "../utils/wordUtils";
import { applyCorrection } from "../services/dictionaryService";
import { wordReviewService } from "../services/wordReviewService";
import WordReviewStats from "../components/WordReviewStats";
import FunctionTriggers from "../components/FunctionTriggers";
import { IconArrow, IconBack, IconClose } from "../components/kd/icons";
import type { Word, Correction, Report } from "../types";

type Tab = "pending-words" | "reports" | "corrections" | "functions";

const TAB_LABELS: Record<Tab, string> = {
    "pending-words": "Pending words",
    reports: "Word reports",
    corrections: "Corrections",
    functions: "Functions",
};
type ActionKind = "approve" | "reject";

type ReportWithWord = Report & { word?: Word };
type CorrectionWithWord = Correction;

const getCorrectionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        word_spelling: "Word Spelling",
        definition: "Definition / Meaning",
        part_of_speech: "Part of Speech",
        example_sentence: "Example Sentence",
        example_translation: "Example Translation",
        pronunciation: "Pronunciation",
    };
    return labels[type] || type;
};

const languageLabel = (code: string): string => {
    if (code === "en") return "English";
    if (code === "hi") return "हि";
    return code.toUpperCase();
};

const sectionBox: React.CSSProperties = {
    background: "var(--kd-surface)",
    border: "1px solid var(--kd-line)",
    borderRadius: 18,
};

const Admin = () => {
    const auth = useAuth() as ReturnType<typeof useAuth> & {
        rolesLoading?: boolean;
    };
    const { currentUser, isAdmin, userRoles } = auth;
    const rolesLoading = auth.rolesLoading ?? false;
    const navigate = useNavigate();

    const [pendingWords, setPendingWords] = useState<Word[]>([]);
    const [wordReports, setWordReports] = useState<ReportWithWord[]>([]);
    const [corrections, setCorrections] = useState<CorrectionWithWord[]>([]);
    const [loading, setLoading] = useState(true);
    const [reportsLoading, setReportsLoading] = useState(true);
    const [correctionsLoading, setCorrectionsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reportsError, setReportsError] = useState<string | null>(null);
    const [correctionsError, setCorrectionsError] = useState<string | null>(
        null,
    );
    const [actionInProgress, setActionInProgress] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("pending-words");
    const [showStats, setShowStats] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [currentAction, setCurrentAction] = useState<{
        wordId: string;
        action: ActionKind;
    } | null>(null);
    const [actionComment, setActionComment] = useState("");
    const [pendingIndex, setPendingIndex] = useState(0);
    const [inlineNote, setInlineNote] = useState("");

    useEffect(() => {
        const fetchPendingWords = async () => {
            if (!currentUser || rolesLoading) return;
            if (!isAdmin) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const q = query(
                    collection(db, "words"),
                    where("status", "in", [
                        "pending_review",
                        "community_approved",
                    ]),
                    orderBy("createdAt", "desc"),
                );
                const querySnapshot = await getDocs(q);
                const words: Word[] = [];
                querySnapshot.forEach((d) => {
                    words.push({ id: d.id, ...d.data() } as Word);
                });
                setPendingWords(words);
                setPendingIndex(0);
            } catch (err) {
                console.error("Error fetching pending words:", err);
                setError("Failed to load pending words. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchPendingWords();
    }, [isAdmin, currentUser, userRoles, rolesLoading]);

    useEffect(() => {
        const fetchWordReports = async () => {
            if (
                !currentUser ||
                rolesLoading ||
                !isAdmin ||
                activeTab !== "reports"
            )
                return;
            setReportsLoading(true);
            setReportsError(null);
            try {
                const reportsQuery = query(
                    collection(db, "reports"),
                    where("status", "==", "open"),
                    orderBy("createdAt", "desc"),
                );
                const querySnapshot = await getDocs(reportsQuery);
                const reports: ReportWithWord[] = [];
                for (const docSnapshot of querySnapshot.docs) {
                    const reportData = {
                        id: docSnapshot.id,
                        ...docSnapshot.data(),
                    } as ReportWithWord;
                    try {
                        const wordDoc = await getDoc(
                            doc(db, "words", reportData.word_id),
                        );
                        if (wordDoc.exists()) {
                            reportData.word = {
                                id: wordDoc.id,
                                ...wordDoc.data(),
                            } as Word;
                        }
                    } catch (wordErr) {
                        console.error(
                            "Error fetching word for report:",
                            wordErr,
                        );
                    }
                    reports.push(reportData);
                }
                setWordReports(reports);
            } catch (err) {
                console.error("Error fetching word reports:", err);
                setReportsError("Failed to load reports. Please try again.");
            } finally {
                setReportsLoading(false);
            }
        };
        fetchWordReports();
    }, [isAdmin, activeTab, currentUser, userRoles, rolesLoading]);

    useEffect(() => {
        const fetchCorrections = async () => {
            if (
                !currentUser ||
                rolesLoading ||
                !isAdmin ||
                activeTab !== "corrections"
            )
                return;
            setCorrectionsLoading(true);
            setCorrectionsError(null);
            try {
                const correctionsQuery = query(
                    collection(db, "corrections"),
                    where("status", "in", ["approved", "shallow_review"]),
                    orderBy("createdAt", "desc"),
                );
                const querySnapshot = await getDocs(correctionsQuery);
                const correctionsData: CorrectionWithWord[] = [];
                for (const docSnapshot of querySnapshot.docs) {
                    const correctionData = {
                        id: docSnapshot.id,
                        ...docSnapshot.data(),
                    } as CorrectionWithWord;
                    try {
                        const wordDoc = await getDoc(
                            doc(db, "words", correctionData.word_id),
                        );
                        if (wordDoc.exists()) {
                            correctionData.word = {
                                id: wordDoc.id,
                                ...wordDoc.data(),
                            } as Word;
                        }
                    } catch (wordErr) {
                        console.error(
                            "Error fetching word for correction:",
                            wordErr,
                        );
                    }
                    correctionsData.push(correctionData);
                }
                setCorrections(correctionsData);
            } catch (err) {
                console.error("Error fetching corrections:", err);
                setCorrectionsError(
                    "Failed to load corrections. Please try again.",
                );
            } finally {
                setCorrectionsLoading(false);
            }
        };
        fetchCorrections();
    }, [isAdmin, activeTab, currentUser, userRoles, rolesLoading]);

    const handleActionWithComment = (wordId: string, action: ActionKind) => {
        setCurrentAction({ wordId, action });
        setActionComment(inlineNote);
        setShowCommentModal(true);
    };

    const submitAction = async () => {
        if (!currentAction || !currentUser) return;
        setActionInProgress(true);
        setShowCommentModal(false);
        try {
            const { wordId, action } = currentAction;
            const event =
                action === "approve" ? "ADMIN_APPROVE" : "ADMIN_REJECT";
            const result = await wordReviewService.transitionWord(
                wordId,
                event,
                {
                    userId: currentUser.uid,
                    comment: actionComment.trim(),
                },
            );
            if (!result.success)
                throw new Error(result.error || `Failed to ${action} word`);
            const remaining = pendingWords.filter((word) => word.id !== wordId);
            setPendingWords(remaining);
            setPendingIndex((idx) =>
                Math.min(idx, Math.max(0, remaining.length - 1)),
            );
            setInlineNote("");
            setSuccessMessage(`Word ${action}d successfully.`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error(`Error ${currentAction.action}ing word:`, err);
            setError(
                `Failed to ${currentAction.action} word. Please try again.`,
            );
            setTimeout(() => setError(null), 3000);
        } finally {
            setActionInProgress(false);
            setCurrentAction(null);
            setActionComment("");
        }
    };

    const handleResolveReport = async (reportId: string) => {
        if (actionInProgress || !currentUser) return;
        setActionInProgress(true);
        try {
            const reportRef = doc(db, "reports", reportId);
            await updateDoc(reportRef, {
                status: "resolved",
                resolvedAt: new Date(),
                resolvedBy: currentUser.uid,
            });
            setWordReports(
                wordReports.filter((report) => report.id !== reportId),
            );
            setSuccessMessage("Report marked as resolved.");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Error resolving report:", err);
            setReportsError("Failed to resolve report. Please try again.");
            setTimeout(() => setReportsError(null), 3000);
        } finally {
            setActionInProgress(false);
        }
    };

    const handleApproveCorrection = async (correctionId: string) => {
        if (actionInProgress || !currentUser) return;
        setActionInProgress(true);
        try {
            const correction = corrections.find((c) => c.id === correctionId);
            if (!correction) throw new Error("Correction not found");

            await updateDoc(doc(db, "corrections", correctionId), {
                status: "approved",
                updatedAt: new Date(),
            });

            const applyResult = await applyCorrection(correctionId);
            if (!applyResult.success) throw new Error(applyResult.error);

            if (correction.word_id) {
                await wordReviewService.transitionWord(
                    correction.word_id,
                    "HANDLE_CORRECTION",
                    {
                        userId: currentUser.uid,
                        correctionId,
                        action: "approved",
                    },
                );
            }
            setCorrections(corrections.filter((c) => c.id !== correctionId));
            setSuccessMessage("Correction approved and applied.");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Error approving correction:", err);
            setCorrectionsError(
                "Failed to approve correction. Please try again.",
            );
            setTimeout(() => setCorrectionsError(null), 3000);
        } finally {
            setActionInProgress(false);
        }
    };

    const handleRejectCorrection = async (correctionId: string) => {
        if (actionInProgress || !currentUser) return;
        setActionInProgress(true);
        try {
            const correction = corrections.find((c) => c.id === correctionId);
            if (!correction) throw new Error("Correction not found");

            await updateDoc(doc(db, "corrections", correctionId), {
                status: "rejected",
                updatedAt: new Date(),
            });

            if (correction.word_id) {
                await wordReviewService.transitionWord(
                    correction.word_id,
                    "HANDLE_CORRECTION",
                    {
                        userId: currentUser.uid,
                        correctionId,
                        action: "rejected",
                    },
                );
            }
            setCorrections(corrections.filter((c) => c.id !== correctionId));
            setSuccessMessage("Correction rejected.");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error("Error rejecting correction:", err);
            setCorrectionsError(
                "Failed to reject correction. Please try again.",
            );
            setTimeout(() => setCorrectionsError(null), 3000);
        } finally {
            setActionInProgress(false);
        }
    };

    const counts: Record<Tab, number | null> = {
        "pending-words": pendingWords.length,
        reports: wordReports.length || null,
        corrections: corrections.length || null,
        functions: null,
    };

    const currentWord = useMemo<Word | null>(() => {
        if (!pendingWords.length) return null;
        return pendingWords[Math.min(pendingIndex, pendingWords.length - 1)];
    }, [pendingWords, pendingIndex]);

    const handlePrev = () => {
        setPendingIndex((idx) => Math.max(0, idx - 1));
        setInlineNote("");
    };
    const handleNext = () => {
        setPendingIndex((idx) =>
            Math.min(pendingWords.length - 1, idx + 1),
        );
        setInlineNote("");
    };

    if (!currentUser || (!isAdmin && !rolesLoading)) {
        return (
            <div
                className="max-w-[1200px] mx-auto px-6 md:px-14 py-16"
                style={{ color: "var(--kd-ink)" }}
            >
                <div className="kd-eyebrow mb-3">Admin · access</div>
                <h1
                    className="kd-font-serif"
                    style={{
                        fontWeight: 500,
                        fontSize: "clamp(36px, 5vw, 56px)",
                        lineHeight: 1.05,
                        letterSpacing: "-0.025em",
                        margin: 0,
                    }}
                >
                    The review desk is staff-only.
                </h1>
                <p
                    className="kd-font-serif mt-4 max-w-[560px]"
                    style={{
                        fontSize: "clamp(16px, 1.4vw, 19px)",
                        color: "var(--kd-ink-soft)",
                        lineHeight: 1.5,
                    }}
                >
                    You don't have permission to access this page. If you think
                    that's a mistake, ask another admin to grant you the role.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="mt-8 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 kd-font-sans text-[13px] font-semibold"
                    style={{ background: "var(--kd-accent)", color: "#FBF7EE" }}
                >
                    Return to home
                </button>
            </div>
        );
    }

    return (
        <div style={{ background: "var(--kd-bg)", color: "var(--kd-ink)" }}>
            <section className="max-w-[1200px] mx-auto px-6 md:px-14 pt-12">
                <div className="kd-eyebrow mb-4">Admin · Decision review</div>
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div className="min-w-0">
                        <h1
                            className="kd-font-serif"
                            style={{
                                fontWeight: 500,
                                fontSize: "clamp(40px, 6vw, 64px)",
                                lineHeight: 1.05,
                                letterSpacing: "-0.025em",
                                margin: 0,
                                color: "var(--kd-ink)",
                            }}
                        >
                            The review desk
                            <span style={{ color: "var(--kd-accent)" }}>.</span>
                        </h1>
                        <p
                            className="kd-font-serif mt-3 max-w-[640px]"
                            style={{
                                fontSize: "clamp(15px, 1.3vw, 18px)",
                                color: "var(--kd-ink-soft)",
                                lineHeight: 1.55,
                            }}
                        >
                            Words become public when admins approve them. Vote
                            with care — your call is one of the few standing
                            between a draft and the dictionary.
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowStats((s) => !s)}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 kd-font-sans text-[13px] font-medium transition-colors"
                            style={{
                                background: "transparent",
                                color: "var(--kd-ink)",
                                border: "1px solid var(--kd-line)",
                            }}
                        >
                            {showStats ? "Hide stats" : "Show stats"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("pending-words");
                                setPendingIndex(0);
                            }}
                            disabled={pendingWords.length === 0}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 kd-font-sans text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: "var(--kd-accent)",
                                color: "#FBF7EE",
                            }}
                        >
                            Review next
                            <IconArrow size={14} weight={2.2} />
                        </button>
                    </div>
                </div>

                {showStats && (
                    <div className="mt-8" style={sectionBox}>
                        <div className="p-6">
                            <WordReviewStats />
                        </div>
                    </div>
                )}

                <div
                    className="mt-10 flex gap-7 items-end overflow-x-auto"
                    style={{ borderBottom: "1px solid var(--kd-line)" }}
                >
                    {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => {
                        const isActive = activeTab === tab;
                        const count = counts[tab];
                        return (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className="relative inline-flex items-center gap-2 py-3.5 whitespace-nowrap kd-font-sans"
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 500,
                                        color: isActive
                                            ? "var(--kd-ink)"
                                            : "var(--kd-ink-soft)",
                                    }}
                                >
                                    {TAB_LABELS[tab]}
                                </span>
                                {count !== null && count !== undefined && (
                                    <span
                                        className="kd-font-mono"
                                        style={{
                                            fontSize: 11,
                                            padding: "2px 7px",
                                            borderRadius: 999,
                                            background: isActive
                                                ? "var(--kd-accent-tint)"
                                                : "var(--kd-surface-alt)",
                                            color: isActive
                                                ? "var(--kd-accent)"
                                                : "var(--kd-ink-soft)",
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {count}
                                    </span>
                                )}
                                {isActive && (
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            right: 0,
                                            bottom: -1,
                                            height: 2.5,
                                            background: "var(--kd-accent)",
                                            borderRadius: 2,
                                        }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="max-w-[1200px] mx-auto px-6 md:px-14 py-8 pb-24">
                {(successMessage || error) && (
                    <div
                        className="mb-6 px-4 py-3 rounded-2xl kd-font-sans text-[14px]"
                        style={{
                            background: error
                                ? "color-mix(in srgb, #C7522A 10%, var(--kd-surface))"
                                : "color-mix(in srgb, var(--kd-sage) 12%, var(--kd-surface))",
                            color: error
                                ? "var(--kd-accent)"
                                : "var(--kd-sage)",
                            border: "1px solid var(--kd-line)",
                        }}
                    >
                        {error || successMessage}
                    </div>
                )}

                {activeTab === "pending-words" && (
                    <FocusedPendingReview
                        loading={loading}
                        currentWord={currentWord}
                        index={pendingIndex}
                        total={pendingWords.length}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        onApprove={() =>
                            currentWord &&
                            handleActionWithComment(currentWord.id, "approve")
                        }
                        onReject={() =>
                            currentWord &&
                            handleActionWithComment(currentWord.id, "reject")
                        }
                        actionInProgress={actionInProgress}
                        note={inlineNote}
                        onNoteChange={setInlineNote}
                    />
                )}

                {activeTab === "reports" && (
                    <ReportsList
                        loading={reportsLoading}
                        reports={wordReports}
                        onResolve={handleResolveReport}
                        actionInProgress={actionInProgress}
                        errorText={reportsError}
                    />
                )}

                {activeTab === "corrections" && (
                    <CorrectionsList
                        loading={correctionsLoading}
                        corrections={corrections}
                        onApprove={handleApproveCorrection}
                        onReject={handleRejectCorrection}
                        actionInProgress={actionInProgress}
                        errorText={correctionsError}
                    />
                )}

                {activeTab === "functions" && (
                    <div style={sectionBox}>
                        <div
                            className="px-6 py-4 kd-font-sans"
                            style={{
                                borderBottom: "1px solid var(--kd-line)",
                                color: "var(--kd-ink)",
                                fontWeight: 600,
                                fontSize: 14,
                                letterSpacing: "-0.005em",
                            }}
                        >
                            Cloud function triggers
                        </div>
                        <div className="p-6">
                            <FunctionTriggers />
                        </div>
                    </div>
                )}

                <div className="mt-10 flex justify-end">
                    <Link
                        to="/word-review-demo"
                        className="kd-font-mono"
                        style={{
                            fontSize: 11,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            color: "var(--kd-ink-mute)",
                            textDecoration: "underline",
                            textUnderlineOffset: 4,
                        }}
                    >
                        Review-system demo →
                    </Link>
                </div>
            </section>

            {showCommentModal && currentAction && (
                <CommentModal
                    action={currentAction.action}
                    comment={actionComment}
                    onCommentChange={setActionComment}
                    onCancel={() => {
                        setShowCommentModal(false);
                        setCurrentAction(null);
                    }}
                    onSubmit={submitAction}
                    inProgress={actionInProgress}
                />
            )}
        </div>
    );
};

interface FocusedPendingReviewProps {
    loading: boolean;
    currentWord: Word | null;
    index: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
    onApprove: () => void;
    onReject: () => void;
    actionInProgress: boolean;
    note: string;
    onNoteChange: (value: string) => void;
}

const FocusedPendingReview = ({
    loading,
    currentWord,
    index,
    total,
    onPrev,
    onNext,
    onApprove,
    onReject,
    actionInProgress,
    note,
    onNoteChange,
}: FocusedPendingReviewProps) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <span
                    className="kd-font-mono"
                    style={{
                        fontSize: 11,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--kd-ink-mute)",
                    }}
                >
                    Loading queue…
                </span>
            </div>
        );
    }

    if (!currentWord) {
        return (
            <div
                style={sectionBox}
                className="px-8 py-16 text-center kd-font-sans"
            >
                <div className="kd-eyebrow mb-2">Inbox zero</div>
                <p
                    className="kd-font-serif"
                    style={{
                        fontSize: 22,
                        color: "var(--kd-ink)",
                        margin: 0,
                    }}
                >
                    No pending submissions to review.
                </p>
                <p
                    className="mt-2"
                    style={{
                        color: "var(--kd-ink-soft)",
                        fontSize: 14,
                    }}
                >
                    New words will appear here once contributors submit them.
                </p>
            </div>
        );
    }

    const approvals = (currentWord.reviewed_by || []).filter(
        (r) => r.vote === "approve",
    );
    const rejections = (currentWord.reviewed_by || []).filter(
        (r) => r.vote === "reject",
    );

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="min-w-0">
                <div className="flex items-center justify-between mb-4">
                    <div
                        className="kd-font-mono"
                        style={{
                            fontSize: 11,
                            letterSpacing: "0.16em",
                            textTransform: "uppercase",
                            color: "var(--kd-ink-mute)",
                        }}
                    >
                        Reviewing {index + 1} of {total}
                        <span style={{ margin: "0 8px" }}>·</span>
                        Submitted {formatDate(currentWord.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={onPrev}
                            disabled={index === 0}
                            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 kd-font-sans text-[13px] transition-colors disabled:opacity-40"
                            style={{
                                background: "transparent",
                                color: "var(--kd-ink-soft)",
                                border: "1px solid var(--kd-line)",
                            }}
                        >
                            <IconBack size={12} weight={2} />
                            Prev
                        </button>
                        <button
                            type="button"
                            onClick={onNext}
                            disabled={index >= total - 1}
                            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 kd-font-sans text-[13px] transition-colors disabled:opacity-40"
                            style={{
                                background: "transparent",
                                color: "var(--kd-ink-soft)",
                                border: "1px solid var(--kd-line)",
                            }}
                        >
                            Next
                            <IconArrow size={12} weight={2} />
                        </button>
                    </div>
                </div>

                <article
                    style={{
                        background: "var(--kd-surface)",
                        border: "1px solid var(--kd-line)",
                        borderRadius: 20,
                        overflow: "hidden",
                    }}
                >
                    <div
                        className="px-6 py-3 kd-font-mono"
                        style={{
                            fontSize: 10.5,
                            letterSpacing: "0.18em",
                            textTransform: "uppercase",
                            color: "var(--kd-ink-mute)",
                            borderBottom: "1px solid var(--kd-line-soft)",
                            background: "var(--kd-surface-alt)",
                        }}
                    >
                        Preview · how it will appear in the dictionary
                    </div>

                    <div className="px-6 md:px-10 py-8">
                        <div className="flex flex-wrap items-baseline gap-4">
                            <h2
                                className="kd-font-serif"
                                style={{
                                    fontWeight: 500,
                                    fontSize: "clamp(40px, 5vw, 64px)",
                                    lineHeight: 1.05,
                                    letterSpacing: "-0.02em",
                                    margin: 0,
                                    color: "var(--kd-ink)",
                                }}
                            >
                                {currentWord.kurukh_word}
                            </h2>
                            {currentWord.pronunciation_guide && (
                                <span
                                    className="kd-font-mono"
                                    style={{
                                        color: "var(--kd-ink-soft)",
                                        fontSize: 14,
                                    }}
                                >
                                    /{currentWord.pronunciation_guide}/
                                </span>
                            )}
                            {currentWord.part_of_speech && (
                                <span
                                    className="kd-font-mono"
                                    style={{
                                        fontSize: 10.5,
                                        letterSpacing: "0.18em",
                                        textTransform: "uppercase",
                                        color: "var(--kd-accent)",
                                        background: "var(--kd-accent-tint)",
                                        padding: "3px 8px",
                                        borderRadius: 999,
                                    }}
                                >
                                    {currentWord.part_of_speech}
                                </span>
                            )}
                        </div>

                        <div className="mt-7 flex flex-col gap-6">
                            {(currentWord.meanings || []).map(
                                (meaning, idx) => (
                                    <div
                                        key={idx}
                                        className="grid gap-3 md:grid-cols-[80px_1fr] items-start"
                                    >
                                        <div
                                            className="kd-font-mono"
                                            style={{
                                                fontSize: 11,
                                                letterSpacing: "0.16em",
                                                textTransform: "uppercase",
                                                color: "var(--kd-ink-mute)",
                                                paddingTop: 6,
                                            }}
                                        >
                                            {languageLabel(meaning.language)}
                                        </div>
                                        <div>
                                            <div
                                                className="kd-font-serif"
                                                style={{
                                                    fontSize: 22,
                                                    lineHeight: 1.35,
                                                    color: "var(--kd-ink)",
                                                }}
                                            >
                                                {meaning.definition}
                                            </div>
                                            {meaning.example_sentence_kurukh && (
                                                <div
                                                    className="mt-3 rounded-xl px-4 py-3"
                                                    style={{
                                                        background:
                                                            "var(--kd-surface-alt)",
                                                        border:
                                                            "1px solid var(--kd-line-soft)",
                                                    }}
                                                >
                                                    <div
                                                        className="kd-font-serif italic"
                                                        style={{
                                                            color:
                                                                "var(--kd-ink)",
                                                            fontSize: 15,
                                                        }}
                                                    >
                                                        “
                                                        {
                                                            meaning.example_sentence_kurukh
                                                        }
                                                        ”
                                                    </div>
                                                    {meaning.example_sentence_translation && (
                                                        <div
                                                            className="mt-1.5"
                                                            style={{
                                                                color:
                                                                    "var(--kd-ink-soft)",
                                                                fontSize: 13,
                                                            }}
                                                        >
                                                            —{" "}
                                                            {
                                                                meaning.example_sentence_translation
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </article>

                <div
                    className="mt-6 px-6 py-5"
                    style={{
                        background: "var(--kd-surface)",
                        border: "1px solid var(--kd-line)",
                        borderRadius: 18,
                    }}
                >
                    <div className="kd-eyebrow mb-4">Review trail</div>
                    {currentWord.reviewed_by &&
                    currentWord.reviewed_by.length > 0 ? (
                        <ul className="flex flex-col gap-3">
                            {currentWord.reviewed_by.map((entry, idx) => (
                                <li
                                    key={`${entry.user_id}-${idx}`}
                                    className="flex items-start gap-3"
                                >
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            marginTop: 6,
                                            background:
                                                entry.vote === "approve"
                                                    ? "var(--kd-sage)"
                                                    : "var(--kd-accent)",
                                        }}
                                    />
                                    <div className="min-w-0">
                                        <div
                                            className="kd-font-sans"
                                            style={{
                                                color: "var(--kd-ink)",
                                                fontSize: 14,
                                            }}
                                        >
                                            <span style={{ fontWeight: 600 }}>
                                                {entry.user_id.slice(0, 8)}
                                            </span>
                                            <span
                                                style={{
                                                    color:
                                                        "var(--kd-ink-soft)",
                                                }}
                                            >
                                                {" "}
                                                · {entry.vote}d ·{" "}
                                                {formatDate(entry.timestamp)}
                                            </span>
                                        </div>
                                        {entry.comment && (
                                            <div
                                                className="kd-font-serif italic mt-1"
                                                style={{
                                                    color: "var(--kd-ink-soft)",
                                                    fontSize: 14,
                                                }}
                                            >
                                                “{entry.comment}”
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p
                            className="kd-font-sans"
                            style={{
                                color: "var(--kd-ink-soft)",
                                fontSize: 14,
                            }}
                        >
                            No reviewers have weighed in yet. You'll be the
                            first.
                        </p>
                    )}
                </div>
            </div>

            <aside className="flex flex-col gap-4">
                <div
                    className="p-6"
                    style={{
                        background: "var(--kd-surface)",
                        border: "1px solid var(--kd-line)",
                        borderRadius: 18,
                    }}
                >
                    <div className="kd-eyebrow mb-3">Your vote · decision</div>
                    <p
                        className="kd-font-serif"
                        style={{
                            fontSize: 18,
                            lineHeight: 1.4,
                            color: "var(--kd-ink)",
                            margin: 0,
                        }}
                    >
                        Approve and{" "}
                        <em
                            style={{
                                color: "var(--kd-accent)",
                                fontStyle: "italic",
                            }}
                        >
                            “{currentWord.kurukh_word}”
                        </em>{" "}
                        goes live in the dictionary.
                    </p>

                    {(approvals.length > 0 || rejections.length > 0) && (
                        <div
                            className="mt-4 kd-font-mono"
                            style={{
                                fontSize: 11,
                                letterSpacing: "0.14em",
                                textTransform: "uppercase",
                                color: "var(--kd-ink-mute)",
                            }}
                        >
                            {approvals.length} approval
                            {approvals.length === 1 ? "" : "s"}
                            {rejections.length > 0 && (
                                <>
                                    {" "}
                                    · {rejections.length} rejection
                                    {rejections.length === 1 ? "" : "s"}
                                </>
                            )}{" "}
                            so far
                        </div>
                    )}

                    <textarea
                        className="mt-4 w-full kd-font-sans"
                        rows={3}
                        value={note}
                        onChange={(e) => onNoteChange(e.target.value)}
                        placeholder="Add a note (optional) — context helps future reviewers."
                        style={{
                            background: "var(--kd-bg)",
                            border: "1px solid var(--kd-line)",
                            borderRadius: 12,
                            padding: "10px 12px",
                            fontSize: 13,
                            color: "var(--kd-ink)",
                            resize: "vertical",
                            outline: "none",
                        }}
                    />

                    <button
                        type="button"
                        onClick={onApprove}
                        disabled={actionInProgress}
                        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full py-2.5 kd-font-sans text-[14px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                        style={{
                            background: "var(--kd-sage)",
                            color: "#FBF7EE",
                        }}
                    >
                        Approve · publish word
                    </button>
                    <div className="mt-3 flex items-center justify-between kd-font-sans text-[13px]">
                        <button
                            type="button"
                            onClick={onNext}
                            disabled={actionInProgress}
                            style={{
                                color: "var(--kd-ink-soft)",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                            }}
                        >
                            Skip
                        </button>
                        <span
                            aria-hidden="true"
                            style={{ color: "var(--kd-line)" }}
                        >
                            |
                        </span>
                        <button
                            type="button"
                            onClick={onReject}
                            disabled={actionInProgress}
                            style={{
                                color: "var(--kd-accent)",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                                fontWeight: 600,
                            }}
                        >
                            Reject
                        </button>
                    </div>
                </div>

                <div
                    className="p-6"
                    style={{
                        background: "var(--kd-surface)",
                        border: "1px solid var(--kd-line)",
                        borderRadius: 18,
                    }}
                >
                    <div className="kd-eyebrow mb-3">Submitter</div>
                    <div className="flex items-center gap-3">
                        <div
                            className="kd-font-mono"
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "var(--kd-sage-soft)",
                                color: "#FBF7EE",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                fontWeight: 600,
                            }}
                        >
                            {currentWord.contributor_id
                                .slice(0, 2)
                                .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div
                                className="kd-font-sans"
                                style={{
                                    color: "var(--kd-ink)",
                                    fontSize: 14,
                                    fontWeight: 600,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                                title={currentWord.contributor_id}
                            >
                                {currentWord.contributor_id.slice(0, 12)}…
                            </div>
                            <div
                                className="kd-font-mono"
                                style={{
                                    fontSize: 11,
                                    color: "var(--kd-ink-mute)",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                Submitted {formatDate(currentWord.createdAt)}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="p-6"
                    style={{
                        background: "var(--kd-surface)",
                        border: "1px solid var(--kd-line)",
                        borderRadius: 18,
                    }}
                >
                    <div className="kd-eyebrow mb-3">Community signal</div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div
                                className="kd-font-serif"
                                style={{
                                    fontSize: 28,
                                    color: "var(--kd-sage)",
                                    lineHeight: 1,
                                }}
                            >
                                {currentWord.community_votes_for || 0}
                            </div>
                            <div
                                className="kd-font-mono mt-1"
                                style={{
                                    fontSize: 10.5,
                                    letterSpacing: "0.16em",
                                    textTransform: "uppercase",
                                    color: "var(--kd-ink-mute)",
                                }}
                            >
                                Approvals
                            </div>
                        </div>
                        <div>
                            <div
                                className="kd-font-serif"
                                style={{
                                    fontSize: 28,
                                    color: "var(--kd-accent)",
                                    lineHeight: 1,
                                }}
                            >
                                {currentWord.community_votes_against || 0}
                            </div>
                            <div
                                className="kd-font-mono mt-1"
                                style={{
                                    fontSize: 10.5,
                                    letterSpacing: "0.16em",
                                    textTransform: "uppercase",
                                    color: "var(--kd-ink-mute)",
                                }}
                            >
                                Flags
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
};

interface ReportsListProps {
    loading: boolean;
    reports: ReportWithWord[];
    onResolve: (id: string) => void;
    actionInProgress: boolean;
    errorText: string | null;
}

const ReportsList = ({
    loading,
    reports,
    onResolve,
    actionInProgress,
    errorText,
}: ReportsListProps) => {
    if (loading) {
        return (
            <div className="py-16 text-center">
                <span
                    className="kd-font-mono"
                    style={{
                        fontSize: 11,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--kd-ink-mute)",
                    }}
                >
                    Loading reports…
                </span>
            </div>
        );
    }
    if (reports.length === 0) {
        return (
            <div
                style={sectionBox}
                className="px-8 py-16 text-center kd-font-sans"
            >
                <div className="kd-eyebrow mb-2">No flags</div>
                <p
                    className="kd-font-serif"
                    style={{ fontSize: 22, margin: 0, color: "var(--kd-ink)" }}
                >
                    No open reports to investigate.
                </p>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-4">
            {errorText && (
                <div
                    className="px-4 py-3 rounded-2xl kd-font-sans text-[14px]"
                    style={{
                        background:
                            "color-mix(in srgb, #C7522A 10%, var(--kd-surface))",
                        color: "var(--kd-accent)",
                        border: "1px solid var(--kd-line)",
                    }}
                >
                    {errorText}
                </div>
            )}
            {reports.map((report) => (
                <article
                    key={report.id}
                    style={{
                        background: "var(--kd-surface)",
                        border: "1px solid var(--kd-line)",
                        borderRadius: 18,
                    }}
                    className="p-6"
                >
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <div>
                            <h3
                                className="kd-font-serif"
                                style={{
                                    fontSize: 28,
                                    lineHeight: 1.1,
                                    margin: 0,
                                    color: "var(--kd-ink)",
                                    fontWeight: 500,
                                }}
                            >
                                {report.word?.kurukh_word || "Unknown word"}
                            </h3>
                            <div
                                className="kd-font-mono mt-1"
                                style={{
                                    fontSize: 11,
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                    color: "var(--kd-ink-mute)",
                                }}
                            >
                                Reported {formatDate(report.createdAt)}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onResolve(report.id)}
                            disabled={actionInProgress}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 kd-font-sans text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                            style={{
                                background: "var(--kd-sage)",
                                color: "#FBF7EE",
                            }}
                        >
                            Mark resolved
                        </button>
                    </div>
                    <div className="mt-4 kd-font-sans">
                        <div
                            className="kd-eyebrow"
                            style={{ marginBottom: 6 }}
                        >
                            Reason
                        </div>
                        <p
                            className="kd-font-serif"
                            style={{
                                fontSize: 16,
                                color: "var(--kd-ink)",
                                margin: 0,
                                lineHeight: 1.5,
                            }}
                        >
                            {report.reason}
                        </p>
                    </div>
                    {report.details && (
                        <div className="mt-4 kd-font-sans">
                            <div
                                className="kd-eyebrow"
                                style={{ marginBottom: 6 }}
                            >
                                Details
                            </div>
                            <p
                                style={{
                                    fontSize: 14,
                                    color: "var(--kd-ink-soft)",
                                    margin: 0,
                                    lineHeight: 1.55,
                                }}
                            >
                                {report.details}
                            </p>
                        </div>
                    )}
                </article>
            ))}
        </div>
    );
};

interface CorrectionsListProps {
    loading: boolean;
    corrections: CorrectionWithWord[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    actionInProgress: boolean;
    errorText: string | null;
}

const CorrectionsList = ({
    loading,
    corrections,
    onApprove,
    onReject,
    actionInProgress,
    errorText,
}: CorrectionsListProps) => {
    if (loading) {
        return (
            <div className="py-16 text-center">
                <span
                    className="kd-font-mono"
                    style={{
                        fontSize: 11,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--kd-ink-mute)",
                    }}
                >
                    Loading corrections…
                </span>
            </div>
        );
    }
    if (corrections.length === 0) {
        return (
            <div
                style={sectionBox}
                className="px-8 py-16 text-center kd-font-sans"
            >
                <div className="kd-eyebrow mb-2">All clear</div>
                <p
                    className="kd-font-serif"
                    style={{ fontSize: 22, margin: 0, color: "var(--kd-ink)" }}
                >
                    No corrections waiting on you.
                </p>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-4">
            {errorText && (
                <div
                    className="px-4 py-3 rounded-2xl kd-font-sans text-[14px]"
                    style={{
                        background:
                            "color-mix(in srgb, #C7522A 10%, var(--kd-surface))",
                        color: "var(--kd-accent)",
                        border: "1px solid var(--kd-line)",
                    }}
                >
                    {errorText}
                </div>
            )}
            {corrections.map((correction) => (
                <article
                    key={correction.id}
                    style={{
                        background: "var(--kd-surface)",
                        border: "1px solid var(--kd-line)",
                        borderRadius: 18,
                    }}
                    className="p-6"
                >
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <div>
                            <h3
                                className="kd-font-serif"
                                style={{
                                    fontSize: 28,
                                    lineHeight: 1.1,
                                    margin: 0,
                                    color: "var(--kd-ink)",
                                    fontWeight: 500,
                                }}
                            >
                                {correction.word?.kurukh_word ||
                                    "Unknown word"}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span
                                    className="kd-font-mono"
                                    style={{
                                        fontSize: 10.5,
                                        letterSpacing: "0.18em",
                                        textTransform: "uppercase",
                                        padding: "3px 8px",
                                        borderRadius: 999,
                                        background: "var(--kd-accent-tint)",
                                        color: "var(--kd-accent)",
                                    }}
                                >
                                    {getCorrectionTypeLabel(
                                        correction.correction_type,
                                    )}
                                </span>
                                {correction.status === "approved" && (
                                    <span
                                        className="kd-font-mono"
                                        style={{
                                            fontSize: 10.5,
                                            letterSpacing: "0.18em",
                                            textTransform: "uppercase",
                                            padding: "3px 8px",
                                            borderRadius: 999,
                                            background:
                                                "color-mix(in srgb, var(--kd-sage) 14%, transparent)",
                                            color: "var(--kd-sage)",
                                        }}
                                    >
                                        Community approved
                                    </span>
                                )}
                                {correction.status === "shallow_review" && (
                                    <span
                                        className="kd-font-mono"
                                        style={{
                                            fontSize: 10.5,
                                            letterSpacing: "0.18em",
                                            textTransform: "uppercase",
                                            padding: "3px 8px",
                                            borderRadius: 999,
                                            background:
                                                "var(--kd-surface-alt)",
                                            color: "var(--kd-ink-soft)",
                                        }}
                                    >
                                        Needs review
                                    </span>
                                )}
                            </div>
                            <div
                                className="kd-font-mono mt-2"
                                style={{
                                    fontSize: 11,
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                    color: "var(--kd-ink-mute)",
                                }}
                            >
                                {correction.createdAt &&
                                    `Submitted ${formatDate(
                                        correction.createdAt,
                                    )}`}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => onReject(correction.id)}
                                disabled={actionInProgress}
                                className="inline-flex items-center gap-1 rounded-full px-4 py-2 kd-font-sans text-[13px] font-medium transition-colors disabled:opacity-60"
                                style={{
                                    background: "transparent",
                                    color: "var(--kd-accent)",
                                    border: "1px solid var(--kd-accent)",
                                }}
                            >
                                Reject
                            </button>
                            <button
                                type="button"
                                onClick={() => onApprove(correction.id)}
                                disabled={actionInProgress}
                                className="inline-flex items-center gap-1 rounded-full px-4 py-2 kd-font-sans text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                                style={{
                                    background: "var(--kd-sage)",
                                    color: "#FBF7EE",
                                }}
                            >
                                Apply correction
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 grid md:grid-cols-2 gap-3">
                        <div>
                            <div
                                className="kd-eyebrow"
                                style={{ marginBottom: 6 }}
                            >
                                Current
                            </div>
                            <div
                                className="kd-font-serif px-4 py-3"
                                style={{
                                    background:
                                        "color-mix(in srgb, #C7522A 8%, var(--kd-surface))",
                                    border: "1px solid var(--kd-line)",
                                    borderRadius: 12,
                                    color: "var(--kd-ink)",
                                    fontSize: 15,
                                    lineHeight: 1.45,
                                }}
                            >
                                {correction.current_value ||
                                    "No current value"}
                            </div>
                        </div>
                        <div>
                            <div
                                className="kd-eyebrow"
                                style={{ marginBottom: 6 }}
                            >
                                Proposed
                            </div>
                            <div
                                className="kd-font-serif px-4 py-3"
                                style={{
                                    background:
                                        "color-mix(in srgb, var(--kd-sage) 12%, var(--kd-surface))",
                                    border: "1px solid var(--kd-line)",
                                    borderRadius: 12,
                                    color: "var(--kd-ink)",
                                    fontSize: 15,
                                    lineHeight: 1.45,
                                }}
                            >
                                {correction.proposed_change}
                            </div>
                        </div>
                    </div>

                    {correction.explanation && (
                        <div className="mt-4">
                            <div
                                className="kd-eyebrow"
                                style={{ marginBottom: 6 }}
                            >
                                Explanation
                            </div>
                            <p
                                className="kd-font-serif italic"
                                style={{
                                    fontSize: 14,
                                    color: "var(--kd-ink-soft)",
                                    margin: 0,
                                    lineHeight: 1.55,
                                }}
                            >
                                “{correction.explanation}”
                            </p>
                        </div>
                    )}
                </article>
            ))}
        </div>
    );
};

interface CommentModalProps {
    action: ActionKind;
    comment: string;
    onCommentChange: (value: string) => void;
    onCancel: () => void;
    onSubmit: () => void;
    inProgress: boolean;
}

const CommentModal = ({
    action,
    comment,
    onCommentChange,
    onCancel,
    onSubmit,
    inProgress,
}: CommentModalProps) => {
    const isApprove = action === "approve";
    return (
        <div
            className="fixed inset-0 z-[80] flex items-center justify-center px-4"
            style={{ background: "rgba(28, 24, 20, 0.5)" }}
            onClick={onCancel}
        >
            <div
                className="w-full max-w-[480px] p-6"
                style={{
                    background: "var(--kd-surface)",
                    border: "1px solid var(--kd-line)",
                    borderRadius: 18,
                    boxShadow: "var(--kd-shadow-elev)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-1">
                    <div className="kd-eyebrow">
                        Confirm · {isApprove ? "approve" : "reject"}
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        aria-label="Close"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full"
                        style={{
                            color: "var(--kd-ink-soft)",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        <IconClose size={18} />
                    </button>
                </div>
                <h3
                    className="kd-font-serif"
                    style={{
                        fontSize: 24,
                        margin: 0,
                        color: "var(--kd-ink)",
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                    }}
                >
                    {isApprove
                        ? "Publish this word?"
                        : "Reject this submission?"}
                </h3>
                <p
                    className="kd-font-sans mt-2"
                    style={{
                        color: "var(--kd-ink-soft)",
                        fontSize: 14,
                        lineHeight: 1.5,
                    }}
                >
                    {isApprove
                        ? "Add a short note (optional) — context helps future reviewers and the contributor."
                        : "Add a short note for the contributor — it'll explain why their submission was rejected."}
                </p>
                <textarea
                    className="mt-4 w-full kd-font-sans"
                    rows={4}
                    value={comment}
                    onChange={(e) => onCommentChange(e.target.value)}
                    placeholder={`Optional note for ${action}…`}
                    style={{
                        background: "var(--kd-bg)",
                        border: "1px solid var(--kd-line)",
                        borderRadius: 12,
                        padding: "10px 12px",
                        fontSize: 14,
                        color: "var(--kd-ink)",
                        resize: "vertical",
                        outline: "none",
                    }}
                />
                <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={inProgress}
                        className="rounded-full px-4 py-2 kd-font-sans text-[13px] font-medium"
                        style={{
                            background: "transparent",
                            color: "var(--kd-ink-soft)",
                            border: "1px solid var(--kd-line)",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={inProgress}
                        className="rounded-full px-5 py-2 kd-font-sans text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                        style={{
                            background: isApprove
                                ? "var(--kd-sage)"
                                : "var(--kd-accent)",
                            color: "#FBF7EE",
                        }}
                    >
                        {inProgress
                            ? "Working…"
                            : isApprove
                              ? "Approve · publish"
                              : "Reject submission"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Admin;
