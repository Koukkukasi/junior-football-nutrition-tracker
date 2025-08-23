export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h3>
              <p className="text-gray-700 mb-4">
                When you register for the Service, we collect:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Name and email address</li>
                <li>Age and age group</li>
                <li>Football position and team information</li>
                <li>Training schedule and goals</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mb-2">Health and Nutrition Data</h3>
              <p className="text-gray-700 mb-4">
                Through your use of the Service, we collect:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Food and meal logs</li>
                <li>Performance metrics (energy levels, sleep hours)</li>
                <li>Training data and match information</li>
                <li>Nutrition goals and preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Provide personalized nutrition recommendations</li>
                <li>Track and analyze your nutrition and performance</li>
                <li>Enable team features and coach interactions</li>
                <li>Send important notifications about your account</li>
                <li>Improve our Service and develop new features</li>
                <li>Ensure the security and integrity of the Service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              
              <h3 className="text-lg font-medium text-gray-800 mb-2">With Your Team</h3>
              <p className="text-gray-700 mb-4">
                If you join a team, your coach and team administrators can view:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Your nutrition scores and meal frequency</li>
                <li>Performance metrics and energy levels</li>
                <li>Training participation</li>
              </ul>
              <p className="text-gray-700 mb-4">
                <strong>Note:</strong> Specific meal details remain private unless you choose to share them.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mb-2">Third Parties</h3>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or rent your personal information. We may share information with:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Service providers who help us operate the Service (e.g., hosting, authentication)</li>
                <li>Law enforcement when required by law</li>
                <li>In connection with a merger or acquisition of our company</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication through Clerk</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                For users under 13 years old:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Parental consent is required for registration</li>
                <li>Parents can request access to their child's information</li>
                <li>Parents can request deletion of their child's account</li>
                <li>We do not knowingly collect information from children under 10</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights (GDPR)</h2>
              <p className="text-gray-700 mb-4">
                Under the General Data Protection Regulation (GDPR), you have the right to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Object:</strong> Oppose certain types of data processing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your information for as long as:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Your account is active</li>
                <li>Needed to provide you services</li>
                <li>Required to comply with legal obligations</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can request account deletion at any time. Upon deletion, we will remove your personal information within 30 days, except where retention is required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Keep you signed in</li>
                <li>Remember your preferences</li>
                <li>Analyze Service usage</li>
                <li>Improve user experience</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in compliance with applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or through the Service. Your continued use after changes indicates acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                For privacy-related questions or to exercise your rights:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Email: privacy@juniorfootballnutrition.com</li>
                <li>Data Protection Officer: dpo@juniorfootballnutrition.com</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You also have the right to lodge a complaint with your local data protection authority.
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                This Privacy Policy is designed to comply with GDPR and other applicable data protection laws.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}