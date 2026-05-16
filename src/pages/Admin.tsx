import { useState, useEffect } from "react";
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
import type { Word, Correction, Report } from "../types";

type Tab = "pending-words" | "reports" | "corrections" | "functions";

const TAB_LABELS: Record<Tab, string> = {
    "pending-words": "Pending Words",
    reports: "Word Reports",
    corrections: "Corrections",
    functions: "Functions",
};
type ActionKind = "approve" | "reject";

type ReportWithWord = Report & { word?: Word };
type CorrectionWithWord = Correction;

const getCorrectionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        word_spelling: "Word Spelling",
        definition: "Definition/Meaning",
        part_of_speech: "Part of Speech",
        example_sentence: "Example Sentence",
        example_translation: "Example Translation",
        pronunciation: "Pronunciation",
    };
    return labels[type] || type;
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
        setActionComment("");
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
            setPendingWords(pendingWords.filter((word) => word.id !== wordId));
            setSuccessMessage(`Word ${action}d successfully!`);
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
            setSuccessMessage("Report marked as resolved!");
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
            setSuccessMessage("Correction approved and applied successfully!");
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
            setSuccessMessage("Correction rejected successfully!");
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

    if (!currentUser || !isAdmin) {
        return (
            <div className="max-w-3xl mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <p className="mb-6">
                        You don't have permission to access this page.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="btn btn-primary"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="flex justify-between items-center mb-6">
                <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowStats(!showStats)}
                >
                    {showStats
                        ? "Hide Statistics"
                        : "Show Dictionary Statistics"}
                </button>
                <Link to="/word-review-demo" className="btn btn-sm btn-primary">
                    Review System Demo
                </Link>
            </div>

            {showStats && (
                <div className="mb-8">
                    <WordReviewStats />
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success mb-6">
                    <span>{successMessage}</span>
                </div>
            )}

            {error && (
                <div className="alert alert-error mb-6">
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex border-b">
                    {(
                        [
                            "pending-words",
                            "reports",
                            "corrections",
                            "functions",
                        ] as Tab[]
                    ).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 p-4 text-center font-medium transition-all ${
                                activeTab === tab
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-500 hover:bg-gray-50"
                            }`}
                        >
                            {TAB_LABELS[tab]}
                        </button>
                    ))}
                </div>

                {activeTab === "pending-words" && (
                    <div>
                        <h2 className="p-4 bg-gray-100 font-bold text-xl border-b">
                            Pending Word Submissions
                        </h2>
                        {loading ? (
                            <div className="flex justify-center items-center py-10">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : pendingWords.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <p>No pending word submissions to review.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {pendingWords.map((word) => (
                                    <div
                                        key={word.id}
                                        className="p-6 hover:bg-gray-50"
                                    >
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold mb-1">
                                                {word.kurukh_word}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Submitted{" "}
                                                {formatDate(word.createdAt)}
                                            </p>
                                        </div>
                                        <div className="mb-4">
                                            {word.meanings?.map(
                                                (meaning, index) => (
                                                    <div
                                                        key={index}
                                                        className="mb-3"
                                                    >
                                                        <p className="font-medium">
                                                            Definition (
                                                            {meaning.language ===
                                                            "en"
                                                                ? "English"
                                                                : "Hindi"}
                                                            ):
                                                        </p>
                                                        <p>
                                                            {meaning.definition}
                                                        </p>
                                                        {meaning.example_sentence_kurukh && (
                                                            <div className="mt-2">
                                                                <p className="font-medium text-sm">
                                                                    Example:
                                                                </p>
                                                                <p className="text-sm italic">
                                                                    {
                                                                        meaning.example_sentence_kurukh
                                                                    }
                                                                </p>
                                                                <p className="text-sm">
                                                                    {
                                                                        meaning.example_sentence_translation
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                            {word.part_of_speech && (
                                                <p className="text-sm mt-2">
                                                    <span className="font-medium">
                                                        Part of Speech:
                                                    </span>{" "}
                                                    {word.part_of_speech}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-3 justify-end">
                                            <button
                                                onClick={() =>
                                                    handleActionWithComment(
                                                        word.id,
                                                        "reject",
                                                    )
                                                }
                                                className="btn btn-outline btn-error"
                                                disabled={actionInProgress}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleActionWithComment(
                                                        word.id,
                                                        "approve",
                                                    )
                                                }
                                                className="btn btn-success"
                                                disabled={actionInProgress}
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "reports" && (
                    <div>
                        <h2 className="p-4 bg-gray-100 font-bold text-xl border-b">
                            Word Reports
                        </h2>
                        {reportsLoading ? (
                            <div className="flex justify-center items-center py-10">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : wordReports.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <p>No reports to display.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {wordReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="p-6 hover:bg-gray-50"
                                    >
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold mb-1">
                                                {report.word?.kurukh_word ||
                                                    "Unknown Word"}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Reported on{" "}
                                                {formatDate(report.createdAt)}
                                            </p>
                                        </div>
                                        <div className="mb-4">
                                            <p className="font-medium">
                                                Reason:
                                            </p>
                                            <p>{report.reason}</p>
                                        </div>
                                        {report.details && (
                                            <div className="mb-4">
                                                <p className="font-medium">
                                                    Details:
                                                </p>
                                                <p className="text-gray-700">
                                                    {report.details}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex gap-3 justify-end">
                                            <button
                                                onClick={() =>
                                                    handleResolveReport(
                                                        report.id,
                                                    )
                                                }
                                                className="btn btn-success"
                                                disabled={actionInProgress}
                                            >
                                                Mark as Resolved
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {reportsError && (
                            <div className="alert alert-error m-4">
                                <span>{reportsError}</span>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "corrections" && (
                    <div>
                        <h2 className="p-4 bg-gray-100 font-bold text-xl border-b">
                            Word Corrections
                        </h2>
                        {correctionsLoading ? (
                            <div className="flex justify-center items-center py-10">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : corrections.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <p>No corrections to review.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {corrections.map((correction) => (
                                    <div
                                        key={correction.id}
                                        className="p-6 hover:bg-gray-50"
                                    >
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold mb-1">
                                                {correction.word?.kurukh_word ||
                                                    "Unknown Word"}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="badge badge-primary">
                                                    {getCorrectionTypeLabel(
                                                        correction.correction_type,
                                                    )}
                                                </div>
                                                {correction.status ===
                                                    "approved" && (
                                                    <div className="badge badge-success">
                                                        Community Approved
                                                    </div>
                                                )}
                                                {correction.status ===
                                                    "shallow_review" && (
                                                    <div className="badge badge-warning">
                                                        Needs Review
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Submitted{" "}
                                                {correction.createdAt &&
                                                    formatDate(
                                                        correction.createdAt,
                                                    )}
                                            </p>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm text-gray-600">
                                                    Current Value:
                                                </h4>
                                                <div className="p-3 bg-red-50 border border-red-200 rounded">
                                                    <span className="text-red-800">
                                                        {correction.current_value ||
                                                            "No current value"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-sm text-gray-600">
                                                    Proposed Change:
                                                </h4>
                                                <div className="p-3 bg-green-50 border border-green-200 rounded">
                                                    <span className="text-green-800">
                                                        {
                                                            correction.proposed_change
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {correction.explanation && (
                                            <div className="mb-4">
                                                <p className="font-medium text-sm text-gray-600 mb-2">
                                                    Explanation:
                                                </p>
                                                <p className="text-sm text-gray-700 italic">
                                                    {correction.explanation}
                                                </p>
                                            </div>
                                        )}
                                        {correctionsError && (
                                            <div className="alert alert-error mb-4">
                                                <span>{correctionsError}</span>
                                            </div>
                                        )}
                                        <div className="flex gap-3 justify-end">
                                            <button
                                                onClick={() =>
                                                    handleRejectCorrection(
                                                        correction.id,
                                                    )
                                                }
                                                className="btn btn-outline btn-error"
                                                disabled={actionInProgress}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleApproveCorrection(
                                                        correction.id,
                                                    )
                                                }
                                                className="btn btn-success"
                                                disabled={actionInProgress}
                                            >
                                                Apply Correction
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "functions" && (
                    <div>
                        <h2 className="p-4 bg-gray-100 font-bold text-xl border-b">
                            Cloud Function Triggers
                        </h2>
                        <FunctionTriggers />
                    </div>
                )}
            </div>

            {showCommentModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">
                            Add Comment (Optional)
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {currentAction?.action === "approve"
                                ? "You can add an optional comment explaining your approval decision."
                                : "You can add an optional comment explaining your rejection decision."}
                        </p>
                        <textarea
                            className="textarea textarea-bordered w-full mb-4"
                            placeholder={`Optional comment for ${currentAction?.action || "action"}...`}
                            value={actionComment}
                            onChange={(e) => setActionComment(e.target.value)}
                            rows={4}
                        />
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => {
                                    setShowCommentModal(false);
                                    setCurrentAction(null);
                                    setActionComment("");
                                }}
                                disabled={actionInProgress}
                            >
                                Cancel
                            </button>
                            <button
                                className={`btn ${
                                    currentAction?.action === "approve"
                                        ? "btn-success"
                                        : "btn-error"
                                }`}
                                onClick={submitAction}
                                disabled={actionInProgress}
                            >
                                {actionInProgress ? (
                                    <span className="loading loading-spinner loading-xs"></span>
                                ) : currentAction?.action === "approve" ? (
                                    "Approve"
                                ) : (
                                    "Reject"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
