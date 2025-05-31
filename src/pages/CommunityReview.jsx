import React, { useState } from 'react';
import CommunityReview from '../components/dictionary/CommunityReview';
import WordCommunityReview from '../components/dictionary/WordCommunityReview';

const CommunityReviewPage = () => {
  const [activeTab, setActiveTab] = useState('words');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Community Review</h1>

      <div className="tabs tabs-boxed mb-6">
        <button
          onClick={() => setActiveTab('words')}
          className={`tab ${activeTab === 'words' ? 'tab-active' : ''}`}
        >
          New Words
        </button>
        <button
          onClick={() => setActiveTab('corrections')}
          className={`tab ${activeTab === 'corrections' ? 'tab-active' : ''}`}
        >
          Corrections
        </button>
      </div>

      {activeTab === 'words' ? <WordCommunityReview /> : <CommunityReview />}
    </div>
  );
};

export default CommunityReviewPage;
