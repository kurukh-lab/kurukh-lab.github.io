import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserContributions } from '../services/dictionaryService';
import { formatDate } from '../utils/wordUtils';

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContributions = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const userContributions = await getUserContributions(currentUser.uid);
        setContributions(userContributions);
      } catch (err) {
        console.error('Error fetching user contributions:', err);
        setError('Failed to load your contributions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContributions();
  }, [currentUser]);

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">User Information</h2>
            
            <div className="flex flex-col gap-2">
              <p className="flex justify-between">
                <span className="text-gray-500">Username:</span>
                <span className="font-medium">{currentUser.username || 'Not set'}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="font-medium">{currentUser.email}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500">Member since:</span>
                <span className="font-medium">{formatDate(currentUser.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="p-4 bg-gray-100 font-bold text-xl border-b">Your Contributions</h2>
            
            {loading ? (
              <div className="flex justify-center py-10">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-error">{error}</p>
              </div>
            ) : contributions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">You haven't contributed any words yet.</p>
                <Link to="/contribute" className="btn btn-primary">
                  Add Your First Word
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {contributions.map((word) => (
                  <div key={word.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">
                          <Link to={`/word/${word.id}`} className="hover:text-primary">
                            {word.kurukh_word}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-500">
                          Status: <span className={`font-medium ${getStatusClass(word.status)}`}>
                            {formatStatus(word.status)}
                          </span>
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        {formatDate(word.createdAt)}
                      </p>
                    </div>
                    
                    {word.meanings && word.meanings.length > 0 && (
                      <p className="mt-2 text-gray-700">
                        {word.meanings[0].definition.length > 100
                          ? `${word.meanings[0].definition.substring(0, 100)}...`
                          : word.meanings[0].definition}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatStatus = (status) => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'pending_review':
      return 'Pending Review';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Unknown';
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'approved':
      return 'text-success';
    case 'pending_review':
      return 'text-warning';
    case 'rejected':
      return 'text-error';
    default:
      return 'text-gray-500';
  }
};

export default UserProfile;
