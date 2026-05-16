import { useState, useEffect } from 'react';
import { getDictionaryStats } from '../../services/dictionaryService';
import { FaBook, FaUsers, FaPlusCircle } from 'react-icons/fa';

// Service returns these fields but older test fixtures use older names.
// Type defensively to allow both.
interface StatsShape {
  totalWords?: number;
  totalApprovedWords?: number;
  totalContributors?: number;
  totalUsers?: number;
  newWordsLastWeek?: number;
}

const DictionaryStats = () => {
  const [stats, setStats] = useState<StatsShape | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getDictionaryStats();
        setStats(data as StatsShape);
      } catch (error) {
        console.error('Error fetching dictionary stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div>Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="stats shadow w-full bg-base-200">
      <div className="stat">
        <div className="stat-figure text-primary">
          <FaBook className="inline-block w-8 h-8 stroke-current" />
        </div>
        <div className="stat-title">Total Words</div>
        <div className="stat-value text-primary">
          {stats?.totalWords ?? stats?.totalApprovedWords ?? 0}
        </div>
        <div className="stat-desc">Across all languages</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-secondary">
          <FaUsers className="inline-block w-8 h-8 stroke-current" />
        </div>
        <div className="stat-title">Contributors</div>
        <div className="stat-value text-secondary">
          {stats?.totalContributors ?? stats?.totalUsers ?? 0}
        </div>
        <div className="stat-desc">Helping grow the dictionary</div>
      </div>

      <div className="stat">
        <div className="stat-figure text-accent">
          <FaPlusCircle className="inline-block w-8 h-8 stroke-current" />
        </div>
        <div className="stat-title">New Words (Last 7 Days)</div>
        <div className="stat-value text-accent">{stats?.newWordsLastWeek ?? 0}</div>
        <div className="stat-desc">Actively expanding</div>
      </div>
    </div>
  );
};

export default DictionaryStats;
