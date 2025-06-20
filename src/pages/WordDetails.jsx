import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWordById } from '../services/dictionaryService';
import { formatDate } from '../utils/wordUtils';
import ReportWordModal from '../components/dictionary/ReportWordModal';
import SuggestCorrectionModal from '../components/dictionary/SuggestCorrectionModal';
import PronunciationButton from '../components/dictionary/PronunciationButton';
import ShareWordButtons from '../components/dictionary/ShareWordButtons';
import LikeButton from '../components/dictionary/LikeButton';
import WordReviewStatus from '../components/WordReviewStatus';
import { useAuth } from '../contexts/AuthContext';

const WordDetails = () => {
  const { wordId } = useParams();
  const { isAdmin, currentUser } = useAuth();
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showReviewDetails, setShowReviewDetails] = useState(false);

  useEffect(() => {
    const fetchWordDetails = async () => {
      if (!wordId) return;

      setLoading(true);
      setError(null);

      try {
        const wordData = await getWordById(wordId);
        if (wordData) {
          setWord(wordData);
        } else {
          setError('Word not found');
        }
      } catch (err) {
        console.error('Error fetching word details:', err);
        setError('Failed to load word details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchWordDetails();
  }, [wordId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4 flex justify-center">
        <span data-testid="loading-spinner" className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !word) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error || 'Word not found'}</span>
        </div>
        <div className="flex justify-center mt-6">
          <Link to="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Link
        to="/"
        className="inline-flex items-center mb-6 text-primary hover:underline"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Dictionary
      </Link>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Word header */}
        <div className="p-6 bg-primary text-white">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{word.kurukh_word}</h1>
            <PronunciationButton text={word.kurukh_word} />
          </div>
          {word.part_of_speech && (
            <p className="mt-2 text-primary-content opacity-90 italic">
              {word.part_of_speech}
            </p>
          )}
        </div>

        {/* Word details */}
        <div className="p-6">
          {/* Meanings */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Meanings</h2>
            {word.meanings && word.meanings.map((meaning, index) => (
              <div key={index} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
                <div className="mb-3">
                  <p className="text-sm text-gray-500">
                    {meaning.language === 'en' ? 'English' : 'Hindi'}
                  </p>
                  <p className="text-lg">{meaning.definition}</p>
                </div>

                {meaning.example_sentence_kurukh && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="font-medium text-sm mb-1">Example:</p>
                    <p className="italic">{meaning.example_sentence_kurukh}</p>
                    <p className="text-gray-700 mt-1">{meaning.example_sentence_translation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Review Status for admin and word owners */}
          {(isAdmin || (currentUser && word.created_by === currentUser.uid)) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Review Status</h3>
                <button
                  onClick={() => setShowReviewDetails(!showReviewDetails)}
                  className="btn btn-xs btn-outline"
                >
                  {showReviewDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showReviewDetails && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <WordReviewStatus wordId={wordId} />
                </div>
              )}
            </div>
          )}

          {/* Metadata and Actions */}
          <div className="text-sm text-gray-500 flex flex-col sm:flex-row justify-between gap-4 border-t pt-4 mt-4">
            <div className="flex items-center gap-4">
              {word.createdAt && (
                <p>Added: {formatDate(word.createdAt)}</p>
              )}

              {/* Word Status */}
              {word.status && (
                <div className="flex items-center gap-1">
                  <span>Status:</span>
                  <span className={`badge ${getStatusBadgeClass(word.status)}`}>
                    {formatStatus(word.status)}
                  </span>
                  {word.status === 'community_review' && word.community_votes_for > 0 && (
                    <span className="text-xs ml-1">({word.community_votes_for}/5 approvals)</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <LikeButton word={word} size="lg" />

              <ShareWordButtons
                word={word.kurukh_word}
                url={window.location.href}
                description={word.meanings?.[0]?.definition}
              />

              <button
                className="btn btn-ghost btn-xs text-primary"
                onClick={() => setShowCorrectionModal(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Suggest Correction
              </button>

              <button
                className="btn btn-ghost btn-xs text-red-500"
                onClick={() => setShowReportModal(true)}
              >
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Word Modal */}
      <ReportWordModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        wordId={word?.id}
        wordText={word?.kurukh_word}
      />

      {/* Suggest Correction Modal */}
      <SuggestCorrectionModal
        isOpen={showCorrectionModal}
        onClose={() => setShowCorrectionModal(false)}
        wordId={word?.id}
        wordText={word?.kurukh_word}
        currentWord={word}
      />
    </div>
  );
};

export default WordDetails;

// Helper functions for formatting word status
const formatStatus = (status) => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'community_review':
      return 'Community Review';
    case 'pending_review':
      return 'Admin Review';
    case 'community_approved':
      return 'Community Approved';
    case 'rejected':
      return 'Rejected';
    case 'community_rejected':
      return 'Community Rejected';
    default:
      return status ? status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'approved':
      return 'badge-success';
    case 'community_review':
      return 'badge-warning';
    case 'pending_review':
      return 'badge-info';
    case 'community_approved':
      return 'badge-info';
    case 'rejected':
    case 'community_rejected':
      return 'badge-error';
    default:
      return 'badge-neutral';
  }
};
