import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const Contribute = () => {
  const { isAuthenticated, token } = useAuth(); // Removed unused 'user' variable
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState({
    kurukh_word: '',
    meanings: [{ language: 'en', definition: '', example_sentence_kurukh: '', example_sentence_translation: '' }],
    part_of_speech: '',
    pronunciation_guide: '',
    tags: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMeaningChange = (index, field, value) => {
    const updatedMeanings = [...formData.meanings];
    updatedMeanings[index][field] = value;
    setFormData({ ...formData, meanings: updatedMeanings });
  };

  const addMeaning = () => {
    setFormData({
      ...formData,
      meanings: [...formData.meanings, { language: 'en', definition: '', example_sentence_kurukh: '', example_sentence_translation: '' }]
    });
  };

  const removeMeaning = (index) => {
    if (formData.meanings.length > 1) {
      const updatedMeanings = [...formData.meanings];
      updatedMeanings.splice(index, 1);
      setFormData({ ...formData, meanings: updatedMeanings });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/contribute' } });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    // Format the data for API submission
    const submitData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
    };

    try {
      const response = await fetch('/api/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(submitData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.errors ? responseData.errors[0].msg : 'Failed to submit word');
      }

      // Reset form on success
      setFormData({
        kurukh_word: '',
        meanings: [{ language: 'en', definition: '', example_sentence_kurukh: '', example_sentence_translation: '' }],
        part_of_speech: '',
        pronunciation_guide: '',
        tags: ''
      });
      
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting word:', error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-center">
                <h2 className="text-3xl font-bold averia-serif-libre-bold mb-4">Contribute to the Kurukh Dictionary</h2>
                <p className="mb-6">To contribute words to the dictionary, you need to be logged in.</p>
                <button 
                  onClick={() => navigate('/login', { state: { from: '/contribute' } })}
                  className="btn btn-primary"
                >
                  Login to Contribute
                </button>
                <p className="mt-4">
                  Don't have an account yet?{' '}
                  <button 
                    onClick={() => navigate('/register', { state: { from: '/contribute' } })}
                    className="text-primary hover:underline"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold averia-serif-libre-bold mb-6 text-center">Contribute a New Word</h2>
            
            {submitSuccess && (
              <div className="alert alert-success mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Thank you! Your word has been submitted and is pending review.</span>
              </div>
            )}

            {submitError && (
              <div className="alert alert-error mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Kurukh Word*</span>
                </label>
                <input 
                  type="text" 
                  name="kurukh_word"
                  value={formData.kurukh_word}
                  onChange={handleChange}
                  placeholder="Enter the Kurukh word"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Pronunciation Guide</span>
                </label>
                <input 
                  type="text" 
                  name="pronunciation_guide"
                  value={formData.pronunciation_guide}
                  onChange={handleChange}
                  placeholder="How is this word pronounced?"
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Part of Speech</span>
                </label>
                <select 
                  name="part_of_speech"
                  value={formData.part_of_speech}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="">Select part of speech</option>
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

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Tags</span>
                </label>
                <input 
                  type="text" 
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="Comma-separated tags (e.g., food, nature, family)"
                  className="input input-bordered w-full"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="label-text font-semibold">Meanings*</label>
                  <button 
                    type="button" 
                    onClick={addMeaning}
                    className="btn btn-sm btn-outline"
                  >
                    + Add Another Meaning
                  </button>
                </div>

                {formData.meanings.map((meaning, index) => (
                  <div key={index} className="bg-base-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Meaning #{index + 1}</h3>
                      {formData.meanings.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeMeaning(index)}
                          className="btn btn-sm btn-ghost btn-circle"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="form-control mb-2">
                      <label className="label">
                        <span className="label-text">Language*</span>
                      </label>
                      <select 
                        value={meaning.language}
                        onChange={(e) => handleMeaningChange(index, 'language', e.target.value)}
                        className="select select-bordered w-full"
                        required
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="bn">Bengali</option>
                        <option value="or">Odia/Oriya</option>
                      </select>
                    </div>

                    <div className="form-control mb-2">
                      <label className="label">
                        <span className="label-text">Definition*</span>
                      </label>
                      <input 
                        type="text"
                        value={meaning.definition}
                        onChange={(e) => handleMeaningChange(index, 'definition', e.target.value)}
                        placeholder="Enter the meaning"
                        className="input input-bordered w-full"
                        required
                      />
                    </div>

                    <div className="form-control mb-2">
                      <label className="label">
                        <span className="label-text">Example Sentence (in Kurukh)</span>
                      </label>
                      <input 
                        type="text"
                        value={meaning.example_sentence_kurukh}
                        onChange={(e) => handleMeaningChange(index, 'example_sentence_kurukh', e.target.value)}
                        placeholder="An example sentence using this word in Kurukh"
                        className="input input-bordered w-full"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Example Sentence Translation</span>
                      </label>
                      <input 
                        type="text"
                        value={meaning.example_sentence_translation}
                        onChange={(e) => handleMeaningChange(index, 'example_sentence_translation', e.target.value)}
                        placeholder="Translation of the example sentence"
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Word'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
