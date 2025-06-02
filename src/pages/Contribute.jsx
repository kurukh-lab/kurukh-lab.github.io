import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addWord } from '../services/dictionaryService';
import { auth } from '../config/firebase';

const Contribute = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Language code to name mapping
  const getLanguageName = (code) => {
    const languageMap = {
      'en': 'English',
      'hi': 'Hindi',
      'bn': 'Bengali',
      'te': 'Telugu',
      'ta': 'Tamil',
      'ml': 'Malayalam',
      'kn': 'Kannada',
      'gu': 'Gujarati',
      'or': 'Odia',
      'pa': 'Punjabi',
      'as': 'Assamese',
      'ur': 'Urdu'
    };
    return languageMap[code] || code;
  };
  const [formData, setFormData] = useState({
    kurukh_word: '',
    meanings: [
      {
        language: 'en', // default language (English)
        definition: '',
        example_sentence_kurukh: '',
        example_sentence_translation: '',
      }
    ],
    part_of_speech: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleMeaningChange = (index, field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      meanings: prevData.meanings.map((meaning, i) => 
        i === index ? { ...meaning, [field]: value } : meaning
      )
    }));
  };

  const addMeaning = () => {
    // Find the next available language
    const usedLanguages = formData.meanings.map(m => m.language);
    const availableLanguages = ['en', 'hi', 'bn', 'te', 'ta', 'ml', 'kn', 'gu', 'or', 'pa', 'as', 'ur'];
    const nextLanguage = availableLanguages.find(lang => !usedLanguages.includes(lang)) || 'en';
    
    setFormData((prevData) => ({
      ...prevData,
      meanings: [
        ...prevData.meanings,
        {
          language: nextLanguage,
          definition: '',
          example_sentence_kurukh: '',
          example_sentence_translation: '',
        }
      ]
    }));
  };

  const removeMeaning = (index) => {
    if (formData.meanings.length > 1) {
      setFormData((prevData) => ({
        ...prevData,
        meanings: prevData.meanings.filter((_, i) => i !== index)
      }));
    }
  };

  // Helper function to check if a language is already used
  const isLanguageUsed = (languageCode, currentIndex) => {
    return formData.meanings.some((meaning, index) => 
      meaning.language === languageCode && index !== currentIndex
    );
  };

  // Helper function to get word count
  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.kurukh_word.trim()) {
      setError('Kurukh word is required.');
      return;
    }

    // Check if at least one meaning has definition
    const hasValidMeaning = formData.meanings.some(meaning => meaning.definition.trim());
    if (!hasValidMeaning) {
      setError('At least one definition is required.');
      return;
    }

    // Check for duplicate languages
    const languages = formData.meanings.map(m => m.language);
    const uniqueLanguages = [...new Set(languages)];
    if (languages.length !== uniqueLanguages.length) {
      setError('You cannot add multiple definitions in the same language. Please select different languages for each definition.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Check if user is authenticated
      if (!currentUser || !currentUser.uid) {
        setError('You must be logged in to contribute. Please log in and try again.');
        setSubmitting(false);
        return;
      }

      // Add debug information
      console.log('🔑 Current user authentication:', {
        uid: currentUser.uid,
        email: currentUser.email,
        provider: currentUser.providerData?.[0]?.providerId || 'unknown',
        isAnonymous: currentUser.isAnonymous
      });

      // Format the data according to our model
      const wordData = {
        kurukh_word: formData.kurukh_word.trim(),
        meanings: formData.meanings
          .filter(meaning => meaning.definition.trim()) // Only include meanings with definitions
          .map(meaning => ({
            language: meaning.language,
            definition: meaning.definition.trim(),
            example_sentence_kurukh: meaning.example_sentence_kurukh.trim(),
            example_sentence_translation: meaning.example_sentence_translation.trim(),
          })),
        part_of_speech: formData.part_of_speech.trim() || null,
      };

      console.log(`Submitting word with user ID: ${currentUser.uid}`);
      const result = await addWord(wordData, currentUser.uid);

      if (result.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          kurukh_word: '',
          meanings: [
            {
              language: 'en',
              definition: '',
              example_sentence_kurukh: '',
              example_sentence_translation: '',
            }
          ],
          part_of_speech: '',
        });

        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        throw new Error(result.error || 'Failed to add word');
      }
    } catch (err) {
      console.error('Error submitting word:', err);

      // Provide more detailed error messages for common issues
      if (err.code === 'permission-denied') {
        setError('Permission denied. This could be an authentication issue. Please log out and log in again.');
      } else if (err.message && err.message.includes('auth')) {
        setError(`Authentication error: ${err.message}. Please log out and log in again.`);
      } else {
        setError(err.message || 'An error occurred while submitting your contribution. Please try again.');
      }

      // Log detailed debug information
      console.log('📊 Error details:', {
        code: err.code,
        message: err.message,
        stack: err.stack,
        authCurrentUser: auth?.currentUser ? 'present' : 'null',
        userUID: currentUser?.uid || 'none'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Contribute to Kurukh Dictionary</h1>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="mb-6">You need to be logged in to contribute new words to the dictionary.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn btn-outline btn-primary"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Contribute to Kurukh Dictionary</h1>

      {success && (
        <div className="alert alert-success mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Thank you! Your word has been submitted for community review. Once it receives 5 approvals, it will be sent to administrators for final review.</span>
        </div>
      )}

      <div className="alert alert-info mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 className="font-bold">Enhanced Multi-Language Support</h3>
          <p className="text-sm">You can now add definitions and examples in multiple languages for the same word!</p>
          <ol className="text-sm list-decimal ml-5 mt-1">
            <li>Start with at least one definition in any language</li>
            <li>Click "Add Another Language" to include translations</li>
            <li>Each definition can have its own examples</li>
          </ol>
        </div>
      </div>

      <div className="alert alert-info mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 className="font-bold">Community Review Process</h3>
          <p className="text-sm">New words go through two review stages:</p>
          <ol className="text-sm list-decimal ml-5 mt-1">
            <li>Community review (requires 5 approvals)</li>
            <li>Admin final review</li>
          </ol>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text font-medium">Kurukh Word *</span>
            </label>
            <input
              type="text"
              name="kurukh_word"
              value={formData.kurukh_word}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Dynamic Meanings Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <label className="label">
                <span className="label-text font-medium text-lg">Meanings & Examples *</span>
              </label>
              <button
                type="button"
                onClick={addMeaning}
                className="btn btn-sm btn-outline btn-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Another Language
              </button>
            </div>

            {formData.meanings.map((meaning, index) => (
              <div key={index} className="card bg-base-200 p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-sm">Definition #{index + 1}</h4>
                  {formData.meanings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMeaning(index)}
                      className="btn btn-xs btn-circle btn-ghost text-error"
                      title="Remove this definition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Language *</span>
                      {isLanguageUsed(meaning.language, index) && (
                        <span className="label-text-alt text-error">⚠️ Already used</span>
                      )}
                    </label>
                    <select
                      value={meaning.language}
                      onChange={(e) => handleMeaningChange(index, 'language', e.target.value)}
                      className={`select select-bordered w-full ${isLanguageUsed(meaning.language, index) ? 'select-error' : ''}`}
                      required
                    >
                      <option value="en" disabled={isLanguageUsed('en', index)}>English {isLanguageUsed('en', index) ? '(Used)' : ''}</option>
                      <option value="hi" disabled={isLanguageUsed('hi', index)}>Hindi {isLanguageUsed('hi', index) ? '(Used)' : ''}</option>
                      <option value="bn" disabled={isLanguageUsed('bn', index)}>Bengali {isLanguageUsed('bn', index) ? '(Used)' : ''}</option>
                      <option value="te" disabled={isLanguageUsed('te', index)}>Telugu {isLanguageUsed('te', index) ? '(Used)' : ''}</option>
                      <option value="ta" disabled={isLanguageUsed('ta', index)}>Tamil {isLanguageUsed('ta', index) ? '(Used)' : ''}</option>
                      <option value="ml" disabled={isLanguageUsed('ml', index)}>Malayalam {isLanguageUsed('ml', index) ? '(Used)' : ''}</option>
                      <option value="kn" disabled={isLanguageUsed('kn', index)}>Kannada {isLanguageUsed('kn', index) ? '(Used)' : ''}</option>
                      <option value="gu" disabled={isLanguageUsed('gu', index)}>Gujarati {isLanguageUsed('gu', index) ? '(Used)' : ''}</option>
                      <option value="or" disabled={isLanguageUsed('or', index)}>Odia {isLanguageUsed('or', index) ? '(Used)' : ''}</option>
                      <option value="pa" disabled={isLanguageUsed('pa', index)}>Punjabi {isLanguageUsed('pa', index) ? '(Used)' : ''}</option>
                      <option value="as" disabled={isLanguageUsed('as', index)}>Assamese {isLanguageUsed('as', index) ? '(Used)' : ''}</option>
                      <option value="ur" disabled={isLanguageUsed('ur', index)}>Urdu {isLanguageUsed('ur', index) ? '(Used)' : ''}</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Definition *</span>
                      <span className="label-text-alt text-gray-500">
                        {getWordCount(meaning.definition)} words
                      </span>
                    </label>
                    <textarea
                      value={meaning.definition}
                      onChange={(e) => handleMeaningChange(index, 'definition', e.target.value)}
                      className="textarea textarea-bordered w-full"
                      rows="3"
                      placeholder={`Enter definition in ${getLanguageName(meaning.language)}`}
                      required
                    ></textarea>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Example Sentence (in Kurukh)</span>
                    </label>
                    <textarea
                      value={meaning.example_sentence_kurukh}
                      onChange={(e) => handleMeaningChange(index, 'example_sentence_kurukh', e.target.value)}
                      className="textarea textarea-bordered w-full"
                      rows="2"
                      placeholder="Optional: Provide an example sentence in Kurukh"
                    ></textarea>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Example Sentence Translation</span>
                    </label>
                    <textarea
                      value={meaning.example_sentence_translation}
                      onChange={(e) => handleMeaningChange(index, 'example_sentence_translation', e.target.value)}
                      className="textarea textarea-bordered w-full"
                      rows="2"
                      placeholder={`Optional: Translation in ${getLanguageName(meaning.language)}`}
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}

            <div className="alert alert-info mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p className="text-sm">You can add definitions in multiple languages (English, Hindi, Bengali, Telugu, Tamil, Malayalam, Kannada, Gujarati, Odia, Punjabi, Assamese, and Urdu) to make the word more accessible to different users.</p>
              </div>
            </div>
          </div>

          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text font-medium">Part of Speech</span>
            </label>
            <select
              name="part_of_speech"
              value={formData.part_of_speech}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="">-- Select --</option>
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adjective">Adjective</option>
              <option value="adverb">Adverb</option>
              <option value="pronoun">Pronoun</option>
              <option value="preposition">Preposition</option>
              <option value="conjunction">Conjunction</option>
              <option value="interjection">Interjection</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Submitting...
                </>
              ) : (
                'Submit Word'
              )}
            </button>
          </div>
        </form>

        {/* Preview Section */}
        {formData.kurukh_word.trim() && formData.meanings.some(m => m.definition.trim()) && (
          <div className="mt-8 pt-6 border-t border-base-300">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </h3>
            <div className="card bg-base-100 border shadow-sm">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-primary">{formData.kurukh_word}</h2>
                  {formData.part_of_speech && (
                    <span className="badge badge-ghost text-xs">
                      {formData.part_of_speech.charAt(0).toUpperCase() + formData.part_of_speech.slice(1)}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {formData.meanings.filter(m => m.definition.trim()).map((meaning, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-outline text-xs">
                          {getLanguageName(meaning.language)}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-2">{meaning.definition}</p>
                      {meaning.example_sentence_kurukh.trim() && (
                        <div className="bg-base-200 p-2 rounded text-xs">
                          <p className="italic">"{meaning.example_sentence_kurukh}"</p>
                          {meaning.example_sentence_translation.trim() && (
                            <p className="mt-1 text-neutral-content">— {meaning.example_sentence_translation}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Contribute;
