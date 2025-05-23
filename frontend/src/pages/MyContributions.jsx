import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const MyContributions = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, token, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-contributions' } });
      return;
    }

    const fetchContributions = async () => {
      setLoading(true);
      try {
        // Get user's contributions - backend should filter by the authenticated user's ID
        const response = await fetch('/api/words', {
          headers: {
            'x-auth-token': token
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid, log the user out
            logout();
            navigate('/login', { state: { from: '/my-contributions' } });
            throw new Error('Your session has expired. Please log in again.');
          }
          throw new Error('Failed to fetch your contributions');
        }

        const allWords = await response.json();
        
        // We need to filter contributions on the frontend since the backend returns all approved words
        // In a production app, there would be a dedicated endpoint for user contributions
        const userContributions = allWords.filter(word => word.contributor_id === user?.id);
        
        setContributions(userContributions);
        setError(null);
      } catch (err) {
        console.error('Error fetching contributions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [isAuthenticated, token, navigate, logout, user?.id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-success">Approved</span>;
      case 'pending_review':
        return <span className="badge badge-warning">Pending Review</span>;
      case 'rejected':
        return <span className="badge badge-error">Rejected</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Navbar />
      <div className="bg-base-200 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold averia-serif-libre-bold mb-6">My Contributions</h1>
            
            {error && (
              <div className="alert alert-error mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {loading ? (
              <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : contributions.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-xl mb-3">You haven't contributed any words yet</h3>
                <p className="mb-4">Be the first to add a new word to our dictionary!</p>
                <Link 
                  to="/contribute"
                  className="btn btn-primary"
                >
                  Contribute Now
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Kurukh Word</th>
                      <th>Meaning</th>
                      <th>Status</th>
                      <th>Added</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map((word) => (
                      <tr key={word._id} className="hover">
                        <td className="font-semibold">
                          {word.kurukh_word}
                          {word.part_of_speech && (
                            <span className="badge badge-ghost ml-2 text-xs">{word.part_of_speech}</span>
                          )}
                        </td>
                        <td>
                          {word.meanings && word.meanings.length > 0
                            ? word.meanings[0].definition.length > 40 
                              ? word.meanings[0].definition.substring(0, 40) + '...' 
                              : word.meanings[0].definition
                            : 'No definition provided'}
                        </td>
                        <td>{getStatusBadge(word.status)}</td>
                        <td>{new Date(word.createdAt).toLocaleDateString()}</td>
                        <td className="space-x-2">
                          <Link 
                            to={`/word/${word._id}`}
                            className="btn btn-sm btn-outline"
                          >
                            View
                          </Link>
                          {word.status !== 'approved' && (
                            <Link 
                              to={`/edit-word/${word._id}`}
                              className="btn btn-sm btn-primary"
                            >
                              Edit
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
