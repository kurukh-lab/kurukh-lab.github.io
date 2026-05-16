import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

interface ReviewStateCounts {
  draft: number;
  submitted: number;
  pendingCommunityReview: number;
  inCommunityReview: number;
  communityApproved: number;
  communityRejected: number;
  pendingAdminReview: number;
  inAdminReview: number;
  approved: number;
  rejected: number;
  total: number;
}

const zero = (): ReviewStateCounts => ({
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
  total: 0,
});

const statusMap: Record<string, keyof ReviewStateCounts> = {
  draft: 'draft',
  submitted: 'submitted',
  pending_community_review: 'pendingCommunityReview',
  in_community_review: 'inCommunityReview',
  community_approved: 'communityApproved',
  community_rejected: 'communityRejected',
  pending_review: 'pendingAdminReview',
  in_admin_review: 'inAdminReview',
  approved: 'approved',
  rejected: 'rejected',
};

const WordReviewStats = () => {
  const [stats, setStats] = useState<ReviewStateCounts>(zero());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const q = query(collection(db, 'words'));
        const querySnapshot = await getDocs(q);
        const counts = zero();

        querySnapshot.forEach((doc) => {
          const wordData = doc.data() as { status?: string };
          const status = wordData.status || 'submitted';
          const machineState = statusMap[status] || 'submitted';
          counts[machineState] = (counts[machineState] as number) + 1;
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

  const pct = (n: number): string =>
    stats.total > 0 ? ((n / stats.total) * 100).toFixed(1) : '0';
  const approvalDenominator = stats.approved + stats.rejected || 1;
  const approvalRate = ((stats.approved / approvalDenominator) * 100).toFixed(1);

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
              <tr>
                <td>Draft</td>
                <td>{stats.draft}</td>
                <td>{pct(stats.draft)}%</td>
              </tr>
              <tr>
                <td>Submitted</td>
                <td>{stats.submitted}</td>
                <td>{pct(stats.submitted)}%</td>
              </tr>
              <tr className="bg-base-200">
                <td colSpan={3} className="font-medium">
                  Community Review Process
                </td>
              </tr>
              <tr>
                <td>Pending Community Review</td>
                <td>{stats.pendingCommunityReview}</td>
                <td>{pct(stats.pendingCommunityReview)}%</td>
              </tr>
              <tr>
                <td>In Community Review</td>
                <td>{stats.inCommunityReview}</td>
                <td>{pct(stats.inCommunityReview)}%</td>
              </tr>
              <tr>
                <td>Community Approved</td>
                <td>{stats.communityApproved}</td>
                <td>{pct(stats.communityApproved)}%</td>
              </tr>
              <tr>
                <td>Community Rejected</td>
                <td>{stats.communityRejected}</td>
                <td>{pct(stats.communityRejected)}%</td>
              </tr>
              <tr className="bg-base-200">
                <td colSpan={3} className="font-medium">
                  Admin Review Process
                </td>
              </tr>
              <tr>
                <td>Pending Admin Review</td>
                <td>{stats.pendingAdminReview}</td>
                <td>{pct(stats.pendingAdminReview)}%</td>
              </tr>
              <tr>
                <td>In Admin Review</td>
                <td>{stats.inAdminReview}</td>
                <td>{pct(stats.inAdminReview)}%</td>
              </tr>
              <tr className="bg-base-200">
                <td colSpan={3} className="font-medium">
                  Final States
                </td>
              </tr>
              <tr>
                <td>Approved</td>
                <td>{stats.approved}</td>
                <td>{pct(stats.approved)}%</td>
              </tr>
              <tr>
                <td>Rejected</td>
                <td>{stats.rejected}</td>
                <td>{pct(stats.rejected)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Final Approval Rate</h3>
          <div className="flex items-center gap-2">
            <progress
              className="progress progress-success w-full"
              value={(stats.approved / approvalDenominator) * 100}
              max={100}
            ></progress>
            <span>{approvalRate}%</span>
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
