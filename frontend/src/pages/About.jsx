import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Link } from 'react-router-dom';

export const About = () => {
  return (
    <>
      <Navbar />
      <div className="bg-base-200 min-h-screen">
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8">
              <h1 className="text-4xl font-bold averia-serif-libre-bold mb-6 text-center">About the Kurukh Dictionary</h1>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold averia-serif-libre-bold mb-4">Our Mission</h2>
                <p className="mb-4">
                  The Kurukh Dictionary is a collaborative, community-driven project dedicated to preserving, documenting, and sharing the Kurukh language. 
                  Our mission is to create a comprehensive resource for speakers, learners, and researchers of the Kurukh language.
                </p>
                <p>
                  By crowd-sourcing contributions from native speakers, language experts, and community members, we aim to build a living dictionary 
                  that accurately represents the richness and diversity of the Kurukh language as it is spoken today.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold averia-serif-libre-bold mb-4">The Kurukh Language</h2>
                <p className="mb-4">
                  Kurukh (also known as Oraon or Kurux) is a Dravidian language spoken by approximately 2 million people across 
                  eastern India, Bangladesh, and Nepal. It is primarily spoken by the Oraon tribal community and serves as an 
                  important marker of cultural identity.
                </p>
                <p className="mb-4">
                  Despite its rich history and cultural significance, Kurukh is considered a vulnerable language by UNESCO, 
                  facing challenges from dominant regional languages and changing social patterns. Our dictionary project 
                  aims to contribute to language revitalization efforts by making Kurukh more accessible to both community 
                  members and outsiders.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold averia-serif-libre-bold mb-4">How the Dictionary Works</h2>
                <p className="mb-4">
                  Our dictionary operates on a simple principle: community knowledge. Registered users can contribute Kurukh words, 
                  definitions, example sentences, and other linguistic information. Each contribution goes through a review process 
                  to ensure accuracy before being published to the main dictionary.
                </p>
                <p className="mb-4">
                  The dictionary features:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Bidirectional search (Kurukh to other languages and vice versa)</li>
                  <li>Pronunciation guides</li>
                  <li>Example sentences showing contextual usage</li>
                  <li>Part of speech information</li>
                  <li>Tags for easy categorization and discovery</li>
                </ul>
                <p>
                  Anyone can use the dictionary for free, while contributing requires a simple registration process to help maintain quality.
                </p>
              </section>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold averia-serif-libre-bold mb-4">Get Involved</h2>
                <p className="mb-4">
                  There are many ways to contribute to the Kurukh Dictionary project:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>
                    <strong>Contribute words</strong>: Add new entries or improve existing ones by 
                    <Link to="/register" className="text-primary hover:underline"> creating an account</Link>.
                  </li>
                  <li>
                    <strong>Spread the word</strong>: Share the dictionary with Kurukh speakers and language enthusiasts.
                  </li>
                  <li>
                    <strong>Provide feedback</strong>: Help us improve by sharing your thoughts and suggestions.
                  </li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold averia-serif-libre-bold mb-4">Contact Us</h2>
                <p>
                  Have questions, suggestions, or want to get involved beyond contributing words? 
                  Contact us at <a href="mailto:info@kurukhdictionary.org" className="text-primary hover:underline">info@kurukhdictionary.org</a>.
                </p>
              </section>
              
              <div className="mt-12 flex justify-center space-x-4">
                <Link to="/" className="btn btn-outline btn-primary">
                  Return to Home
                </Link>
                <Link to="/contribute" className="btn btn-primary">
                  Start Contributing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
