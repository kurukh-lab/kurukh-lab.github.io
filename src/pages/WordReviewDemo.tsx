import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import WordReviewStatus from '../components/WordReviewStatus';
import WordReviewStateMachine from '../components/WordReviewStateMachine';
import { wordReviewService } from '../services/wordReviewService';
import { db } from '../config/firebase';
import { formatDate } from '../utils/wordUtils';
import type { Word } from '../types';

type WordWithReviewer = Word & { created_by?: string };

const WordReviewDemo = () => {
  const { currentUser, isAdmin } = useAuth();
  const [words, setWords] = useState<WordWithReviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [canTransition, setCanTransition] = useState(false);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        setError(null);
        const q = isAdmin
          ? query(collection(db, 'words'), orderBy('createdAt', 'desc'), limit(10))
          : query(
              collection(db, 'words'),
              where('status', 'in', ['approved', 'in_community_review', 'community_approved']),
              orderBy('createdAt', 'desc'),
              limit(10),
            );
        const querySnapshot = await getDocs(q);
        const wordsData: WordWithReviewer[] = [];
        querySnapshot.forEach((d) => {
          wordsData.push({ id: d.id, ...d.data() } as WordWithReviewer);
        });
        setWords(wordsData);
        if (wordsData.length > 0) setSelectedWordId(wordsData[0].id);
      } catch (err) {
        console.error('Error fetching words:', err);
        setError('Failed to load words. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, [isAdmin, currentUser]);

  useEffect(() => {
    if (!selectedWordId || !currentUser) {
      setCanTransition(false);
      return;
    }
    const selectedWord = words.find((word) => word.id === selectedWordId);
    if (isAdmin) {
      setCanTransition(true);
      return;
    }
    if (selectedWord?.created_by === currentUser.uid) {
      const allowedStates: string[] = ['draft', 'submitted'];
      setCanTransition(allowedStates.includes(selectedWord.status));
      return;
    }
    if (selectedWord?.status === 'in_community_review') {
      const alreadyVoted = selectedWord.reviewed_by?.some(
        (review) => (review as { userId?: string }).userId === currentUser.uid,
      );
      setCanTransition(!alreadyVoted);
      return;
    }
    setCanTransition(false);
  }, [selectedWordId, currentUser, isAdmin, words]);

  const handleSelectWord = (wordId: string) => setSelectedWordId(wordId);

  const handleTransition = async (event: string) => {
    if (!selectedWordId || !currentUser) return;
    try {
      setLoading(true);
      const result = await wordReviewService.transitionWord(selectedWordId, event, {
        userId: currentUser.uid,
      });
      if (!result.success) throw new Error(result.error || `Failed to transition word with event ${event}`);

      const updatedWords = await Promise.all(
        words.map(async (word) => {
          if (word.id === selectedWordId) {
            const { context } = await wordReviewService.loadWordStatus(word.id);
            return {
              ...word,
              ...(context.wordData as Partial<WordWithReviewer>),
            };
          }
          return word;
        }),
      );
      setWords(updatedWords);
    } catch (err) {
      console.error(`Error transitioning word with event ${event}:`, err);
      setError(`Failed to transition word. Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Word Review System Demo</h1>

      {import.meta.env.DEV && <WordReviewStateMachine />}

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="p-4 bg-gray-100 font-bold border-b">Select a Word</h2>
          {loading && words.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : words.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No words available.</p>
            </div>
          ) : (
            <div className="divide-y max-h-96 overflow-y-auto">
              {words.map((word) => (
                <button
                  key={word.id}
                  onClick={() => handleSelectWord(word.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 ${
                    selectedWordId === word.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="mb-1 font-medium">{word.kurukh_word}</div>
                  <div className="text-sm text-gray-500">
                    <div>Status: {word.status}</div>
                    <div>Added: {formatDate(word.createdAt)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="p-4 bg-gray-100 font-bold border-b">Word Review Status</h2>
          {!selectedWordId ? (
            <div className="p-8 text-center text-gray-500">
              <p>Select a word to view its review status.</p>
            </div>
          ) : (
            <div className="p-6">
              <WordReviewStatus wordId={selectedWordId} />
              {canTransition && (
                <div className="mt-8 border-t pt-6">
                  <h3 className="font-medium mb-3">Available Actions:</h3>
                  <div className="flex flex-wrap gap-3">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => handleTransition('ADMIN_APPROVE')}
                          className="btn btn-sm btn-success"
                          disabled={loading}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleTransition('ADMIN_REJECT')}
                          className="btn btn-sm btn-error"
                          disabled={loading}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleTransition('SEND_TO_COMMUNITY_REVIEW')}
                          className="btn btn-sm btn-info"
                          disabled={loading}
                        >
                          Send to Community
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleTransition('COMMUNITY_APPROVE')}
                          className="btn btn-sm btn-outline btn-success"
                          disabled={loading}
                        >
                          Vote Approve
                        </button>
                        <button
                          onClick={() => handleTransition('COMMUNITY_REJECT')}
                          className="btn btn-sm btn-outline btn-error"
                          disabled={loading}
                        >
                          Vote Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordReviewDemo;
