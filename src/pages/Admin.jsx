import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatDate } from '../utils/wordUtils';

const Admin = () => {
  const { currentUser, isAdmin, userRoles, rolesLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingWords, setPendingWords] = useState([]);
  const [wordReports, setWordReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportsError, setReportsError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('pending-words');

  // Debug logging
  console.log('🔍 Admin component render', { 
    currentUser: currentUser?.uid, 
    isAdmin, 
    userRoles,
    rolesLoading,
    pendingWordsCount: pendingWords.length,
    loading 
  });

  // Fetch pending words
  useEffect(() => {
    const fetchPendingWords = async () => {
      console.log('🔍 fetchPendingWords called', { 
        isAdmin, 
        currentUser: currentUser?.uid,
        userRoles,
        rolesLoading,
        hasCurrentUser: !!currentUser,
        rolesLoaded: !rolesLoading
      });
      
      // If user is not logged in, skip
      if (!currentUser) {
        console.log('❌ No current user, skipping fetch');
        return;
      }
      
      // If user roles are still loading, skip (avoid race condition)
      if (rolesLoading) {
        console.log('⏳ User roles still loading, skipping fetch');
        return;
      }
      
      // If user is not admin after roles are loaded, skip
      if (!isAdmin) {
        console.log('❌ Not admin after roles loaded, skipping fetch');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Admin fetching pending words...', { isAdmin });
        const q = query(
          collection(db, 'words'),
          where('status', '==', 'pending_review'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const words = [];
        
        console.log('📄 Query snapshot size:', querySnapshot.size);
        
        querySnapshot.forEach((doc) => {
          const wordData = {
            id: doc.id,
            ...doc.data()
          };
          console.log('📝 Found pending word:', wordData.kurukh_word, wordData.status);
          words.push(wordData);
        });
        
        console.log('📋 Total pending words:', words.length);
        setPendingWords(words);
      } catch (err) {
        console.error("Error fetching pending words:", err);
        setError("Failed to load pending words. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingWords();
  }, [isAdmin, currentUser, userRoles, rolesLoading]);

  // Fetch word reports
  useEffect(() => {
    const fetchWordReports = async () => {
      console.log('🔍 fetchWordReports called', { 
        isAdmin, 
        currentUser: currentUser?.uid,
        userRoles,
        rolesLoading,
        activeTab,
        hasCurrentUser: !!currentUser,
        rolesLoaded: !rolesLoading
      });
      
      // If user is not logged in, skip
      if (!currentUser) {
        console.log('❌ No current user, skipping fetch');
        return;
      }
      
      // If user roles are still loading, skip (avoid race condition)
      if (rolesLoading) {
        console.log('⏳ User roles still loading, skipping fetch');
        return;
      }
      
      // If user is not admin after roles are loaded, skip
      if (!isAdmin) {
        console.log('❌ Not admin after roles loaded, skipping fetch');
        setReportsLoading(false);
        return;
      }
      
      // Only fetch when on reports tab
      if (activeTab !== 'reports') {
        console.log('❌ Not on reports tab, skipping fetch');
        return;
      }
      
      setReportsLoading(true);
      setReportsError(null);
      
      try {
        console.log('🔍 Admin fetching word reports...', { isAdmin, activeTab });
        const reportsQuery = query(
          collection(db, 'reports'),
          where('status', '==', 'open'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(reportsQuery);
        console.log('📄 Reports query snapshot size:', querySnapshot.size);
        
        const reports = [];
        
        for (const docSnapshot of querySnapshot.docs) {
          const reportData = {
            id: docSnapshot.id,
            ...docSnapshot.data()
          };
          
          console.log('📝 Found report:', reportData.id, 'for word:', reportData.word_id);
          
          // Get word details for each report
          try {
            const wordDoc = await getDoc(doc(db, 'words', reportData.word_id));
            if (wordDoc.exists()) {
              reportData.word = {
                id: wordDoc.id,
                ...wordDoc.data()
              };
              console.log('📝 Word details loaded:', reportData.word.kurukh_word);
            } else {
              console.log('❌ Word not found for report:', reportData.word_id);
            }
          } catch (wordErr) {
            console.error('❌ Error fetching word for report:', wordErr);
          }
          
          reports.push(reportData);
        }
        
        console.log('📋 Total reports loaded:', reports.length);
        setWordReports(reports);
      } catch (err) {
        console.error('Error fetching word reports:', err);
        setReportsError('Failed to load reports. Please try again.');
      } finally {
        setReportsLoading(false);
      }
    };
    
    fetchWordReports();
  }, [isAdmin, activeTab, currentUser, userRoles, rolesLoading]);
  
  // Handle word approval
  const handleApproveWord = async (wordId) => {
    if (actionInProgress) return;
    setActionInProgress(true);
    
    try {
      const wordRef = doc(db, 'words', wordId);
      await updateDoc(wordRef, {
        status: 'approved',
        updatedAt: new Date()
      });
      
      // Remove the word from the list
      setPendingWords(pendingWords.filter(word => word.id !== wordId));
      setSuccessMessage("Word approved successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error approving word:", err);
      setError("Failed to approve word. Please try again.");
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setActionInProgress(false);
    }
  };

  // Handle word rejection
  const handleRejectWord = async (wordId) => {
    if (actionInProgress) return;
    setActionInProgress(true);
    
    try {
      const wordRef = doc(db, 'words', wordId);
      await updateDoc(wordRef, {
        status: 'rejected',
        updatedAt: new Date()
      });
      
      // Remove the word from the list
      setPendingWords(pendingWords.filter(word => word.id !== wordId));
      setSuccessMessage("Word rejected successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error rejecting word:", err);
      setError("Failed to reject word. Please try again.");
      
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setActionInProgress(false);
    }
  };

  // Handle report resolution
  const handleResolveReport = async (reportId) => {
    if (actionInProgress) return;
    setActionInProgress(true);
    
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: currentUser.uid
      });
      
      // Remove the report from the list
      setWordReports(wordReports.filter(report => report.id !== reportId));
      setSuccessMessage('Report marked as resolved!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error resolving report:', err);
      setReportsError('Failed to resolve report. Please try again.');
      
      setTimeout(() => {
        setReportsError(null);
      }, 3000);
    } finally {
      setActionInProgress(false);
    }
  };

  // Redirect non-admin users
  if (!currentUser || !isAdmin) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="mb-6">You don't have permission to access this page.</p>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {successMessage && (
        <div className="alert alert-success mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}
      
      {error && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('pending-words')}
            className={`flex-1 p-4 text-center font-medium transition-all ${activeTab === 'pending-words' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Pending Words
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex-1 p-4 text-center font-medium transition-all ${activeTab === 'reports' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Word Reports
          </button>
        </div>
        
        {activeTab === 'pending-words' && (
          <div>
            <h2 className="p-4 bg-gray-100 font-bold text-xl border-b">Pending Word Submissions</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : pendingWords.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No pending word submissions to review.</p>
              </div>
            ) : (
              <div className="divide-y">
                {pendingWords.map((word) => (
                  <div key={word.id} className="p-6 hover:bg-gray-50">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-1">{word.kurukh_word}</h3>
                      <p className="text-sm text-gray-500">
                        Submitted {formatDate(word.createdAt)}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      {word.meanings && word.meanings.map((meaning, index) => (
                        <div key={index} className="mb-3">
                          <p className="font-medium">Definition ({meaning.language === 'en' ? 'English' : 'Hindi'}):</p>
                          <p>{meaning.definition}</p>
                          
                          {meaning.example_sentence_kurukh && (
                            <div className="mt-2">
                              <p className="font-medium text-sm">Example:</p>
                              <p className="text-sm italic">{meaning.example_sentence_kurukh}</p>
                              <p className="text-sm">{meaning.example_sentence_translation}</p>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {word.part_of_speech && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Part of Speech:</span> {word.part_of_speech}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-3 justify-end">
                      <button 
                        onClick={() => handleRejectWord(word.id)}
                        className="btn btn-outline btn-error"
                        disabled={actionInProgress}
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleApproveWord(word.id)}
                        className="btn btn-success"
                        disabled={actionInProgress}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div>
            <h2 className="p-4 bg-gray-100 font-bold text-xl border-b">Word Reports</h2>
            
            {reportsLoading ? (
              <div className="flex justify-center items-center py-10">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : wordReports.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No reports to display.</p>
              </div>
            ) : (
              <div className="divide-y">
                {wordReports.map((report) => (
                  <div key={report.id} className="p-6 hover:bg-gray-50">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-1">{report.word?.kurukh_word || 'Unknown Word'}</h3>
                      <p className="text-sm text-gray-500">
                        Reported on {formatDate(report.createdAt)}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="font-medium">Reason:</p>
                      <p>{report.reason}</p>
                    </div>
                    
                    {report.details && (
                      <div className="mb-4">
                        <p className="font-medium">Details:</p>
                        <p className="text-gray-700">{report.details}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-3 justify-end">
                      <button 
                        onClick={() => handleResolveReport(report.id)}
                        className="btn btn-success"
                        disabled={actionInProgress}
                      >
                        Mark as Resolved
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
