import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

import { SystemDateProvider } from './utils/dateUtils';
import { FirebaseAuthProvider } from './utils/authProvider';

import { WordRepository } from './repositories/WordRepository';
import { UserRepository } from './repositories/UserRepository';
import { ReportRepository } from './repositories/ReportRepository';
import { DailyReportRepository } from './repositories/DailyReportRepository';
import { StaticDataRepository } from './repositories/StaticDataRepository';
import { StatisticsRepository } from './repositories/StatisticsRepository';

import { WordOfTheDayPipeline } from './pipelines/WordOfTheDayPipeline';
import { StatsPipeline } from './pipelines/StatsPipeline';
import { DailyScheduleOrchestrator } from './pipelines/DailyScheduleOrchestrator';

import { AdminService } from './services/AdminService';
import { ReportsService } from './services/ReportsService';
import { StatsService } from './services/StatsService';
import { WordOfTheDayService } from './services/WordOfTheDayService';
import { HomePageDataService } from './services/HomePageDataService';
import { UserService } from './services/UserService';

import { AdminAuthMiddleware } from './middleware/AdminAuthMiddleware';

// Firebase initialisation
initializeApp();
const db = getFirestore();
const auth = getAuth();

// Utilities
const dateProvider = new SystemDateProvider();
const authProvider = new FirebaseAuthProvider(auth);

// Repositories
const wordRepository = new WordRepository(db);
const userRepository = new UserRepository(db);
const reportRepository = new ReportRepository(db);
const dailyReportRepository = new DailyReportRepository(db);
const staticDataRepository = new StaticDataRepository(db);
const statisticsRepository = new StatisticsRepository(db);

// Pipelines
const wordOfTheDayPipeline = new WordOfTheDayPipeline(
  wordRepository,
  dailyReportRepository,
  dateProvider
);
const statsPipeline = new StatsPipeline(
  wordRepository,
  userRepository,
  dailyReportRepository,
  dateProvider
);

// Orchestrator
export const orchestrator = new DailyScheduleOrchestrator(
  [wordOfTheDayPipeline, statsPipeline],
  dateProvider
);

// Services
export const adminService = new AdminService(userRepository, wordRepository, reportRepository);
export const reportsService = new ReportsService(userRepository, reportRepository);
export const statsService = new StatsService(
  wordRepository,
  userRepository,
  statisticsRepository,
  dateProvider
);
export const wordOfTheDayService = new WordOfTheDayService(
  dailyReportRepository,
  wordOfTheDayPipeline
);
export const homePageDataService = new HomePageDataService(
  wordRepository,
  staticDataRepository,
  dateProvider
);
export const userService = new UserService(userRepository, authProvider);

// Middleware
export const adminAuthMiddleware = new AdminAuthMiddleware(userRepository, authProvider);

// Re-export IST_TIMEZONE for use in index.ts scheduled function options
export { IST_TIMEZONE } from './utils/dateUtils';
