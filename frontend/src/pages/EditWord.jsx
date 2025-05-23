import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

export const EditWord = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  // Removed unused wordData state since we're only using formData to manage the form
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    kurukh_word: '',
    part_of_speech: '',
    pronunciation_guide: '',
    tags: [],
    meanings: [
      {
        language: 'en',
        definition: '',
        example_sentence_kurukh: '',
        example_sentence_translation: ''
      }
    ]
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/edit-word/${id}` } });
      return;
    }

    const fetchWordDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/words/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch word details');
        }
        const data = await response.json();
        
        // Check if user is the contributor
        if (!data.contributor_id || data.contributor_id._id !== user.id) {
          setError('You do not have permission to edit this word.');
          setLoading(false);
          return;
        }
        
        // We don't need to store the word data in a separate state variable
        // Initialize form data with the word data
        setFormData({
          kurukh_word: data.kurukh_word || '',
          part_of_speech: data.part_of_speech || '',
          pronunciation_guide: data.pronunciation_guide || '',
          tags: data.tags || [],
          meanings: data.meanings || [
            {
              language: 'en',
              definition: '',
              example_sentence_kurukh: '',
              example_sentence_translation: ''
            }
          ]
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching word details:', err);
        setError('Failed to load word details. This word may not exist or is not approved yet.');
      } finally {
        setLoading(false);
      }
    };

    fetchWordDetails();
  }, [id, isAuthenticated, navigate, user.id]); // Added user.id to the dependency array

  // This is a placeholder for the actual edit functionality
  // It will be implemented in the future
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      // Call the API to update the word
      const response = await fetch(`/api/words/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to update word');
      }
      
      setSubmitSuccess(true);
      // Redirect to the word details page after successful update
      setTimeout(() => {
        navigate(`/word/${id}`);
      }, 2000);
    } catch (err) {
      console.error('Error updating word:', err);
      setFormErrors({ general: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form change handlers are implemented elsewhere, removing unused function
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-base-200 to-base-300">
        <Navbar />
        <main className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-base-200 to-base-300">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <div className="mt-4 text-center">
              <button onClick={() => navigate(-1)} className="btn btn-primary">Go Back</button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-base-200 to-base-300">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold averia-serif-libre-bold mb-6">Edit Word</h1>
          
          {submitSuccess && (
            <div className="alert alert-success mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Word updated successfully! Redirecting...</span>
            </div>
          )}
          
          {formErrors.general && (
            <div className="alert alert-error mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formErrors.general}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center py-8">
              <p className="text-lg">Word editing functionality will be implemented in the future!</p>
              <p className="text-gray-600 mt-2">This is a placeholder for the upcoming edit feature.</p>
            </div>
            
            <div className="flex justify-between">
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Updating...
                  </>
                ) : 'Update Word'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};
