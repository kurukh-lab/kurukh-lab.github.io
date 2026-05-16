import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import type { Word } from '../types';

interface DebugInfo {
  timestamp?: string;
  currentUser?: { uid: string; email: string | null } | null;
  userRoles?: string[];
  rolesLoading?: boolean;
  isAdmin?: boolean;
  hasCurrentUser?: boolean;
  rolesLoaded?: boolean;
}

const AdminDebug = () => {
  const auth = useAuth() as ReturnType<typeof useAuth> & { rolesLoading?: boolean };
  const { currentUser, isAdmin, userRoles } = auth;
  const rolesLoading = auth.rolesLoading ?? false;
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({});
  const [pendingWords, setPendingWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      const info: DebugInfo = {
        timestamp: new Date().toISOString(),
        currentUser: currentUser ? { uid: currentUser.uid, email: currentUser.email } : null,
        userRoles,
        rolesLoading,
        isAdmin,
        hasCurrentUser: !!currentUser,
        rolesLoaded: !rolesLoading,
      };
      setDebugInfo(info);

      if (currentUser && !rolesLoading && isAdmin) {
        try {
          const q = query(
            collection(db, 'words'),
            where('status', '==', 'pending_review'),
            orderBy('createdAt', 'desc'),
          );
          const querySnapshot = await getDocs(q);
          const words: Word[] = [];
          querySnapshot.forEach((d) => {
            words.push({ id: d.id, ...d.data() } as Word);
          });
          setPendingWords(words);
        } catch (err) {
          setError((err as Error).message);
        }
      }
      setLoading(false);
    };
    fetchDebugInfo();
  }, [currentUser, userRoles, isAdmin, rolesLoading]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Debug Page</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Debug Information</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Pending Words Query Result</h2>
        {loading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <span>Error: {error}</span>
          </div>
        ) : (
          <div>
            <p className="mb-4">Found {pendingWords.length} pending words:</p>
            {pendingWords.length === 0 ? (
              <p className="text-gray-500">No pending words found.</p>
            ) : (
              <ul className="space-y-2">
                {pendingWords.map((word) => (
                  <li key={word.id} className="border p-3 rounded">
                    <strong>{word.kurukh_word}</strong> - Status: {word.status}
                    <br />
                    <small>ID: {word.id}</small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDebug;
