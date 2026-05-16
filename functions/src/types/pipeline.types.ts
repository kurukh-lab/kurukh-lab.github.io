export interface PipelineSuccessResult {
  name: string;
  success: true;
  durationMs: number;
  result: unknown;
}

export interface PipelineFailureResult {
  name: string;
  success: false;
  durationMs: number;
  error: string;
}

export type PipelineResult = PipelineSuccessResult | PipelineFailureResult;

export interface ScheduleSummary {
  success: boolean;
  date: string;
  pipelines: PipelineResult[];
  failedCount: number;
}
