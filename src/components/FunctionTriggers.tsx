import { useState } from "react";
import { auth } from "../config/firebase";

type TriggerStatus = "idle" | "loading" | "success" | "error";

interface TriggerState {
    status: TriggerStatus;
    result?: Record<string, unknown>;
    error?: string;
    triggeredAt?: string;
}

interface PipelineRow {
    name: string;
    success: boolean;
    durationMs: number;
    error?: string;
}

const fnUrl = (name: string): string =>
    import.meta.env.DEV
        ? `http://localhost:5011/kurukh-dictionary/us-central1/${name}`
        : `https://us-central1-kurukh-dictionary.cloudfunctions.net/${name}`;

async function callAdminTrigger(
    fnName: string,
): Promise<Record<string, unknown>> {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Not authenticated");
    const res = await fetch(fnUrl(fnName), {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    const data = (await res.json()) as Record<string, unknown>;
    if (!res.ok)
        throw new Error((data.error as string) ?? `HTTP ${res.status}`);
    return data;
}

const TRIGGERS = [
    {
        id: "triggerDailySchedule",
        fnName: "triggerDailySchedule",
        name: "Daily Schedule",
        description:
            "Run all daily pipelines in parallel — Word of the Day and Stats. Use after deploying new pipelines to seed snapshot docs before the midnight cron fires.",
    },
    {
        id: "triggerHomePageUpdate",
        fnName: "triggerHomePageUpdate",
        name: "Home Page Data",
        description:
            "Regenerate the home page cache in static_data/home-page: picks the word of the day and the 6 most recent approved words.",
    },
    {
        id: "triggerWordOfTheDayUpdate",
        fnName: "triggerWordOfTheDayUpdate",
        name: "Word of the Day",
        description:
            "Force-recompute today's word of the day using the IST date seed and persist it to daily_reports/word_of_the_day.",
    },
] as const;

function DailyScheduleResult({ result }: { result: Record<string, unknown> }) {
    const pipelines = (result.pipelines as PipelineRow[]) ?? [];
    return (
        <div className="mt-3 pt-3 border-t border-base-200 space-y-1">
            <p className="text-xs text-gray-500 mb-2">
                Date: {result.date as string}
            </p>
            {pipelines.map((p) => (
                <div
                    key={p.name}
                    className="flex items-center justify-between text-xs"
                >
                    <span className="font-mono text-gray-600">{p.name}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">{p.durationMs}ms</span>
                        {p.success ? (
                            <span className="badge badge-success badge-xs">
                                ok
                            </span>
                        ) : (
                            <span
                                className="badge badge-error badge-xs"
                                title={p.error}
                            >
                                fail
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function HomePageResult({ result }: { result: Record<string, unknown> }) {
    const data = result.data as Record<string, unknown> | undefined;
    if (!data) return null;
    return (
        <div className="mt-3 pt-3 border-t border-base-200 space-y-1">
            <p className="text-xs text-gray-500">Date: {data.date as string}</p>
            <p className="text-xs text-gray-600">
                Recent words:{" "}
                <span className="font-semibold">
                    {data.recentWordsCount as number}
                </span>
            </p>
            {(data.wordOfTheDay as string | undefined) && (
                <p className="text-xs text-gray-600">
                    Word of the day:{" "}
                    <span className="font-semibold font-mono">
                        {data.wordOfTheDay as string}
                    </span>
                </p>
            )}
        </div>
    );
}

function WotdResult({ result }: { result: Record<string, unknown> }) {
    return (
        <div className="mt-3 pt-3 border-t border-base-200 space-y-1">
            <p className="text-xs text-gray-500">
                Date: {result.date as string}
            </p>
            {result.word ? (
                <p className="text-xs text-gray-600">
                    Word:{" "}
                    <span className="font-semibold font-mono">
                        {result.word as string}
                    </span>
                </p>
            ) : (
                <p className="text-xs text-gray-400 italic">
                    No approved words available
                </p>
            )}
        </div>
    );
}

const RESULT_RENDERERS: Record<
    string,
    (result: Record<string, unknown>) => React.ReactNode
> = {
    triggerDailySchedule: (r) => <DailyScheduleResult result={r} />,
    triggerHomePageUpdate: (r) => <HomePageResult result={r} />,
    triggerWordOfTheDayUpdate: (r) => <WotdResult result={r} />,
};

export default function FunctionTriggers() {
    const [states, setStates] = useState<Record<string, TriggerState>>(
        Object.fromEntries(TRIGGERS.map((t) => [t.id, { status: "idle" }])),
    );

    const handleTrigger = async (id: string, fnName: string) => {
        setStates((prev) => ({ ...prev, [id]: { status: "loading" } }));
        try {
            const result = await callAdminTrigger(fnName);
            setStates((prev) => ({
                ...prev,
                [id]: {
                    status: "success",
                    result,
                    triggeredAt: new Date().toISOString(),
                },
            }));
        } catch (err) {
            setStates((prev) => ({
                ...prev,
                [id]: {
                    status: "error",
                    error: err instanceof Error ? err.message : "Unknown error",
                    triggeredAt: new Date().toISOString(),
                },
            }));
        }
    };

    return (
        <div className="p-6">
            <p className="text-sm text-gray-500 mb-6">
                Manually trigger Cloud Functions that normally run on a
                schedule. Each call uses your current session token for admin
                verification.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
                {TRIGGERS.map((trigger) => {
                    const state = states[trigger.id];
                    const isLoading = state.status === "loading";
                    return (
                        <div
                            key={trigger.id}
                            className="card bg-base-100 border border-base-200 shadow-sm flex flex-col"
                        >
                            <div className="card-body p-5 flex flex-col">
                                <div className="flex items-start justify-between mb-1">
                                    <h3 className="card-title text-base">
                                        {trigger.name}
                                    </h3>
                                    {state.status === "success" && (
                                        <span className="badge badge-success badge-sm shrink-0">
                                            Done
                                        </span>
                                    )}
                                    {state.status === "error" && (
                                        <span className="badge badge-error badge-sm shrink-0">
                                            Error
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-gray-500 mb-3 flex-1">
                                    {trigger.description}
                                </p>

                                <div className="font-mono text-xs text-gray-400 bg-base-200 rounded px-2 py-1 mb-4 truncate">
                                    {trigger.fnName}
                                </div>

                                <button
                                    className={`btn btn-sm w-full ${
                                        state.status === "error"
                                            ? "btn-outline btn-error"
                                            : "btn-primary"
                                    }`}
                                    onClick={() =>
                                        handleTrigger(
                                            trigger.id,
                                            trigger.fnName,
                                        )
                                    }
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs" />
                                            Running…
                                        </>
                                    ) : (
                                        "▶ Trigger"
                                    )}
                                </button>

                                {state.triggeredAt && (
                                    <p className="text-xs text-gray-400 mt-2 text-right">
                                        {new Date(
                                            state.triggeredAt,
                                        ).toLocaleTimeString()}
                                    </p>
                                )}

                                {state.status === "error" && state.error && (
                                    <div className="alert alert-error mt-3 py-2 px-3 text-xs">
                                        {state.error}
                                    </div>
                                )}

                                {state.status === "success" &&
                                    state.result &&
                                    RESULT_RENDERERS[trigger.fnName]?.(
                                        state.result,
                                    )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
