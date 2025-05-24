import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../../config/firebase';

const DictionaryStats = () => {
  const [stats, setStats] = useState({
    totalWords: 0,
    recentlyAdded: 0,
    pendingReview: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total approved words count
        const approvedWordsQuery = query(
          collection(db, 'words'),
          where('status', '==', 'approved')
        );
        const approvedSnapshot = await getCountFromServer(approvedWordsQuery);
        
        // Get recently added words count (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentWordsQuery = query(
          collection(db, 'words'),
          where('status', '==', 'approved'),
          where('createdAt', '>=', thirtyDaysAgo)
        );
        const recentSnapshot = await getCountFromServer(recentWordsQuery);
        
        // Get pending review count
        const pendingQuery = query(
          collection(db, 'words'),
          where('status', '==', 'pending_review')
        );
        const pendingSnapshot = await getCountFromServer(pendingQuery);
        
        setStats({
          totalWords: approvedSnapshot.data().count,
          recentlyAdded: recentSnapshot.data().count,
          pendingReview: pendingSnapshot.data().count,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dictionary stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  if (stats.loading) {
    return (
      <div className="flex justify-center py-4">
        <span className="loading loading-spinner loading-sm"></span>
      </div>
    );
  }

  return (
    <div className="stats stats-vertical lg:stats-horizontal shadow">
      <div className="stat">
        <div className="stat-figure text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
        <div className="stat-title">Dictionary Words</div>
        <div className="stat-value text-primary">{stats.totalWords}</div>
        <div className="stat-desc">Total words in dictionary</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
          </svg>
        </div>
        <div className="stat-title">Recent Additions</div>
        <div className="stat-value text-secondary">{stats.recentlyAdded}</div>
        <div className="stat-desc">Added in the last 30 days</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div className="stat-title">Pending Review</div>
        <div className="stat-value text-accent">{stats.pendingReview}</div>
        <div className="stat-desc">Words awaiting approval</div>
      </div>
    </div>
  );
};

export default DictionaryStats;
