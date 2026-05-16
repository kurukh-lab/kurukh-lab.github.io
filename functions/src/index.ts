import { onRequest, onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions/v2';
import cors from 'cors';

import {
  orchestrator,
  adminService,
  reportsService,
  statsService,
  wordOfTheDayService,
  homePageDataService,
  userService,
  adminAuthMiddleware,
  IST_TIMEZONE,
} from './bootstrap';
import { HttpError } from './types/service.types';
import type { ScheduledEvent } from 'firebase-functions/v2/scheduler';

const corsHandler = cors({ origin: true });

setGlobalOptions({ maxInstances: 10 });

// ─── HTTP Functions ───────────────────────────────────────────────────────────

export const helloWorld = onRequest((req, res) => {
  corsHandler(req, res, () => {
    res.json({ message: 'Hello from Kurukh Dictionary API!' });
  });
});

export const getDictionaryStats = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const stats = await statsService.getDictionaryStats();
      res.json({ success: true, stats });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Internal error' });
    }
  });
});

export const getWordOfTheDay = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const result = await wordOfTheDayService.getWordOfTheDay();
      res.json({ success: true, ...result });
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Internal error' });
    }
  });
});

// ─── Admin Manual Triggers ────────────────────────────────────────────────────

export const triggerHomePageUpdate = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      await adminAuthMiddleware.requireAdmin(req);
      console.log('Manual trigger for home page data update...');
      const result = await homePageDataService.updateHomePageData();
      res.json(result);
    } catch (err: unknown) {
      const e = err instanceof HttpError ? err : new HttpError(err instanceof Error ? err.message : 'Internal error', 500);
      res.status(e.statusCode).json({ success: false, error: e.message });
    }
  });
});

export const triggerWordOfTheDayUpdate = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      await adminAuthMiddleware.requireAdmin(req);
      console.log('Manual trigger for word of the day...');
      const result = await wordOfTheDayService.processWordOfTheDay();
      res.json({ success: true, date: result.date, word: result.wordOfTheDay?.kurukh_word ?? null });
    } catch (err: unknown) {
      const e = err instanceof HttpError ? err : new HttpError(err instanceof Error ? err.message : 'Internal error', 500);
      res.status(e.statusCode).json({ success: false, error: e.message });
    }
  });
});

export const triggerDailySchedule = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      await adminAuthMiddleware.requireAdmin(req);
      console.log('Manual trigger for full daily schedule...');
      const summary = await orchestrator.run();
      res.status(summary.success ? 200 : 500).json(summary);
    } catch (err: unknown) {
      const e = err instanceof HttpError ? err : new HttpError(err instanceof Error ? err.message : 'Internal error', 500);
      res.status(e.statusCode).json({ success: false, error: e.message });
    }
  });
});

// ─── Callable Functions ───────────────────────────────────────────────────────

export const reviewWord = onCall({ enforceAppCheck: false }, async (request) => {
  try {
    return await adminService.reviewWord(request.auth?.uid, request.data);
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Internal error');
  }
});

export const resolveReport = onCall({ enforceAppCheck: false }, async (request) => {
  try {
    return await adminService.resolveReport(request.auth?.uid, request.data);
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Internal error');
  }
});

export const getWordReports = onCall({ enforceAppCheck: false }, async (request) => {
  try {
    return await reportsService.getWordReports(request.auth?.uid, request.data);
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Internal error');
  }
});

export const createUser = onCall(async (request) => {
  const { email, password, username } = request.data as { email?: string; password?: string; username?: string };
  if (!email || !password || !username) throw new Error('Email, password, and username are required');
  return userService.createUser({ email, password, username });
});

export const createGoogleUser = onCall(async (request) => {
  if (!request.auth) throw new Error('User must be authenticated');
  const { uid, email, name } = request.auth.token;
  return userService.createGoogleUser(uid, email as string, name as string | undefined, request.data);
});

// ─── Scheduled Functions ──────────────────────────────────────────────────────

export const updateDailyStats = onSchedule('0 0 * * *', async (_event: ScheduledEvent) => {
  await statsService.updateDailyStats();
  console.log('Scheduled daily stats update completed');
});

export const updateHomePageData = onSchedule('0 0 * * *', async (_event: ScheduledEvent) => {
  const result = await homePageDataService.updateHomePageData();
  console.log('Scheduled home page data update completed:', result);
});

export const runDailySchedule = onSchedule(
  { schedule: '0 0 * * *', timeZone: IST_TIMEZONE },
  async (_event: ScheduledEvent) => {
    const summary = await orchestrator.run();
    console.log('Daily schedule summary:', JSON.stringify(summary));
    if (!summary.success) throw new Error(`${summary.failedCount} pipeline(s) failed`);
  }
);
