import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Component to display word review process statistics
 * This shows counts of words in each state of the review process
 */
const WordReviewStats = () => {
  const [stats, setStats] = useState({
    draft: 0,
    submitted: 0,
    pendingCommunityReview: 0,
    inCommunityReview: 0,
    communityApproved: 0,
    communityRejected: 0,
    pendingAdminReview: 0,
    inAdminReview: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Map of Firebase status values to our state machine states
        const statusMap = {
          'draft': 'draft',
          'submitted': 'submitted',
          'pending_community_review': 'pendingCommunityReview',
          'in_community_review': 'inCommunityReview',
          'community_approved': 'communityApproved',
          'community_rejected': 'communityRejected',
          'pending_review': 'pendingAdminReview',
          'in_admin_review': 'inAdminReview',
          'approved': 'approved',
          'rejected': 'rejected'
        };

        // Get all words
        const q = query(collection(db, 'words'));
        const querySnapshot = await getDocs(q);

        // Initialize counts object
        const counts = {
          draft: 0,
          submitted: 0,
          pendingCommunityReview: 0,
          inCommunityReview: 0,
          communityApproved: 0,
          communityRejected: 0,
          pendingAdminReview: 0,
          inAdminReview: 0,
          approved: 0,
          rejected: 0,
          total: 0
        };

        // Count words in each state
        querySnapshot.forEach((doc) => {
          const wordData = doc.data();
          const status = wordData.status;
          const machineState = statusMap[status] || 'submitted';

          counts[machineState]++;
          counts.total++;
        });

        setStats(counts);
      } catch (err) {
        console.error('Error fetching word review stats:', err);
        setError('Failed to load review statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Review Process Statistics</h2>
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Review Process Statistics</h2>
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h2 className="card-title">Review Process Statistics</h2>
        <p className="mb-4">Total words in the dictionary: {stats.total}</p>

        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {/* Draft */}
              <tr>
                <td>Draft</td>
                <td>{stats.draft}</td>
                <td>{stats.total > 0 ? ((stats.draft / stats.total) * 100).toFixed(1) : 0}%</td>
              </tr>

              {/* Submitted */}
              <tr>
                <td>Submitted</td>
                <td>{stats.submitted}</td>
                <td>{stats.total > 0 ? ((stats.submitted / stats.total) * 100).toFixed(1) : 0}%</td>
              </tr>

              {/* Community Review Process */}
              <tr className="bg-base-200">
                <td colSpan="3" className="font-medium">Community Review Process</td>
              </tr>
              <tr>
                <td>Pending Community Review</td>
                <td>{stats.pendingCommunityReview}</td>
                <td>{stats.total > 0 ? ((stats.pendingCommunityReview / stats.total) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td>In Community Review</td>
                <td>{stats.inCommunityReview}</td>
                <td>{stats.total > 0 ? ((stats.inCommunityReview / stats.total) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td>Community Approved</td>
                <td>{stats.communityApproved}</td>
                <td>{stats.total > 0 ? ((stats.communityApproved / stats.total) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td>Community Rejected</td>
                <td>{stats.communityRejected}</td>
                <td>{stats.total > 0 ? ((stats.communityRejected / stats.total) * 100).toFixed(1) : 0}%</td>
              </tr>

              {/* Admin Review Process */}
              <tr className="bg-base-200">
                <td colSpan="3" className="font-medium">Admin Review Process</td>
              </tr>
              <tr>
                <td>Pending Admin Review</td>
                <td>{stats.pendingAdminReview}</td>
                <td>{stats.total > 0 ? ((stats.pendingAdminReview / stats.total) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td>In Admin Review</td>
                <td>{stats.inAdminReview}</td>
                <td>{stats.total > 0 ? ((stats.inAdminReview / stats.total) * 100).toFixed(1) : 0}%</td>
              </tr>

              {/* Final States */}
              <tr className="bg-base-200">
                <td colSpan="3" className="font-medium">Final States</td>
              </tr>
              <tr>
                <td>Approved</td>
                <td>{stats.approved}</td>
                <td>{stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td>Rejected</td>
                <td>{stats.rejected}</td>
                <td>{stats.total > 0 ? ((stats.rejected / stats.total) * 100).toFixed(1) : 0}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Show approval rate */}
        <div className="mt-6">
          <h3 className="font-medium mb-2">Final Approval Rate</h3>
          <div className="flex items-center gap-2">
            <progress
              className="progress progress-success w-full"
              value={(stats.approved) / (stats.approved + stats.rejected || 1) * 100}
              max="100"
            ></progress>
            <span>
              {((stats.approved) / (stats.approved + stats.rejected || 1) * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.approved} approved out of {stats.approved + stats.rejected} final decisions
          </p>
        </div>
      </div>
    </div>
  );
};

export default WordReviewStats;
