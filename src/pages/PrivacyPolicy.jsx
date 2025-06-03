import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-800 mb-0">
            <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            Welcome to the Kurukh Dictionary ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Kurukh language dictionary application.
          </p>
          <p className="mb-4">
            By using our service, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          
          <h3 className="text-xl font-medium mb-3">1. Account Information</h3>
          <p className="mb-4">When you create an account, we collect:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Email address:</strong> Used for account authentication and communication</li>
            <li><strong>Username:</strong> Your chosen display name for the community</li>
            <li><strong>Password:</strong> Securely encrypted using Firebase Authentication</li>
            <li><strong>Account creation date:</strong> For account management purposes</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">2. Contribution Data</h3>
          <p className="mb-4">When you contribute to the dictionary, we collect:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Word submissions:</strong> Kurukh words, definitions, examples, and translations</li>
            <li><strong>Part of speech classifications:</strong> Grammatical categories you assign</li>
            <li><strong>Pronunciation guides:</strong> Phonetic transcriptions you provide</li>
            <li><strong>Tags and categories:</strong> Organizational metadata</li>
            <li><strong>Contributor identification:</strong> Linking contributions to your account</li>
            <li><strong>Submission timestamps:</strong> When contributions were made</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">3. Community Interaction Data</h3>
          <p className="mb-4">When you participate in community features, we collect:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Voting records:</strong> Your approval or rejection votes on word submissions</li>
            <li><strong>Comments:</strong> Text comments on words and contributions</li>
            <li><strong>Comment votes:</strong> Your votes on other users' comments</li>
            <li><strong>Review history:</strong> Your participation in the community review process</li>
            <li><strong>Feedback and reports:</strong> Issues you report about content</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">4. Usage Analytics</h3>
          <p className="mb-4">We collect anonymous usage data including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Word likes:</strong> Anonymous tracking of liked words using browser storage</li>
            <li><strong>Search queries:</strong> Words and terms you search for (anonymized)</li>
            <li><strong>Page views:</strong> Which parts of the application you visit</li>
            <li><strong>Session duration:</strong> How long you use the application</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">5. Technical Information</h3>
          <p className="mb-4">We automatically collect certain technical information:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Browser information:</strong> Browser type and version</li>
            <li><strong>Device information:</strong> Operating system and device type</li>
            <li><strong>IP address:</strong> For security and analytics purposes</li>
            <li><strong>Cookies and local storage:</strong> For functionality and user preferences</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="mb-4">We use the collected information for the following purposes:</p>
          
          <h3 className="text-xl font-medium mb-3">1. Core Dictionary Functionality</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Providing dictionary search and browsing capabilities</li>
            <li>Displaying word definitions, examples, and translations</li>
            <li>Maintaining the quality and accuracy of dictionary content</li>
            <li>Enabling user contributions and community collaboration</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">2. Account Management</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Creating and maintaining user accounts</li>
            <li>Authenticating users and managing sessions</li>
            <li>Providing personalized user profiles</li>
            <li>Tracking user contributions and activity</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">3. Community Features</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Facilitating community review and voting processes</li>
            <li>Managing comment threads and discussions</li>
            <li>Preventing spam and maintaining content quality</li>
            <li>Recognizing and crediting contributors</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">4. Service Improvement</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Analyzing usage patterns to improve functionality</li>
            <li>Identifying popular content and features</li>
            <li>Troubleshooting technical issues</li>
            <li>Developing new features based on user needs</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Storage and Security</h2>
          
          <h3 className="text-xl font-medium mb-3">1. Data Storage</h3>
          <p className="mb-4">Your data is stored securely using:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Firebase Authentication:</strong> For secure user account management</li>
            <li><strong>Firebase Firestore:</strong> For dictionary content and user data</li>
            <li><strong>Browser Local Storage:</strong> For anonymous user preferences and likes</li>
            <li><strong>Encrypted transmission:</strong> All data is transmitted over secure HTTPS connections</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">2. Security Measures</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Industry-standard encryption for data in transit and at rest</li>
            <li>Regular security updates and monitoring</li>
            <li>Access controls and user permission systems</li>
            <li>Secure authentication mechanisms</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
          
          <h3 className="text-xl font-medium mb-3">We Do Not Sell Your Data</h3>
          <p className="mb-4">
            We do not sell, trade, or rent your personal information to third parties.
          </p>

          <h3 className="text-xl font-medium mb-3">Public Information</h3>
          <p className="mb-4">The following information is publicly visible:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Your username (not your email address)</li>
            <li>Word contributions you submit (attributed to your username)</li>
            <li>Comments you post on public content</li>
            <li>Your contribution statistics and activity level</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">Limited Disclosure</h3>
          <p className="mb-4">We may disclose your information only in the following circumstances:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>With your explicit consent</li>
            <li>To comply with legal obligations or court orders</li>
            <li>To protect our rights, property, or safety</li>
            <li>In connection with a business transfer or merger</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">User Rights and Control</h2>
          
          <h3 className="text-xl font-medium mb-3">Your Rights</h3>
          <p className="mb-4">You have the following rights regarding your personal data:</p>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>Access:</strong> View your personal data and account information</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
            <li><strong>Portability:</strong> Export your contributions and data</li>
            <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">How to Exercise Your Rights</h3>
          <p className="mb-4">To exercise these rights:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Log into your account to view and update your information</li>
            <li>Contact us directly for data export or deletion requests</li>
            <li>Use your browser settings to manage cookies and local storage</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Anonymous Usage</h2>
          <p className="mb-4">
            You can use many features of the Kurukh Dictionary without creating an account:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Browse and search dictionary entries</li>
            <li>View word definitions and examples</li>
            <li>Like words (stored locally in your browser)</li>
            <li>Access educational content</li>
          </ul>
          <p className="mb-4">
            When used anonymously, we only collect minimal technical information necessary for the service to function properly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p className="mb-4">
            Our service is designed to be educational and family-friendly. However, we do not knowingly collect personal information from children under 13 years of age. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete such information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">International Users</h2>
          <p className="mb-4">
            Our service is hosted and operated from various global locations through Firebase's infrastructure. By using our service, you consent to the transfer and processing of your information in accordance with this Privacy Policy and applicable data protection laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Updates to This Privacy Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify users of any material changes by:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Posting the updated policy on this page</li>
            <li>Updating the "Last updated" date at the top of this policy</li>
            <li>Sending email notifications for significant changes (if you have an account)</li>
          </ul>
          <p className="mb-4">
            Your continued use of the service after any changes constitutes acceptance of the updated Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="mb-4">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
          </p>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="mb-2"><strong>Email:</strong> privacy@kurukhdictionary.com</p>
            <p className="mb-2"><strong>Subject Line:</strong> Privacy Policy Inquiry</p>
            <p className="mb-0">
              <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 72 hours.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Consent</h2>
          <p className="mb-4">
            By using the Kurukh Dictionary, you consent to our Privacy Policy and agree to the collection, use, and disclosure of your information as described herein.
          </p>
        </section>

        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            This Privacy Policy is part of our commitment to transparency and user privacy in preserving and sharing the Kurukh language.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
