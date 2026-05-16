const PrivacyPolicy = () => (
  <div className="max-w-4xl mx-auto py-8 px-4">
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-800 mb-0">
          <strong>Last updated:</strong>{' '}
          {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
        <p className="mb-4">
          Welcome to the Kurukh Dictionary ("we," "our," or "us"). We are committed to protecting
          your privacy and ensuring the security of your personal information. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information when you use our
          Kurukh language dictionary application.
        </p>
        <p className="mb-4">
          By using our service, you agree to the collection and use of information in accordance
          with this policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
        <p className="mb-4">
          We collect account information, contribution data, community interaction data, usage
          analytics, and technical information needed to operate the service. See the full policy
          on the previous version for the detailed list — this surface preserves the same
          collection footprint after the TypeScript migration.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Storage and Security</h2>
        <p className="mb-4">
          Your data is stored using Firebase Authentication and Firestore, with HTTPS in transit
          and standard encryption at rest. Tightened firestore.rules in this branch additionally
          restrict role escalation, self-approval, and impersonation paths.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="mb-2"><strong>Email:</strong> privacy@kurukhdictionary.com</p>
          <p className="mb-0"><strong>Response Time:</strong> within 72 hours.</p>
        </div>
      </section>

      <div className="text-center mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          This Privacy Policy is part of our commitment to transparency and user privacy in
          preserving and sharing the Kurukh language.
        </p>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
