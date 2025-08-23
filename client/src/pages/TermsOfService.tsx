export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using the Junior Football Nutrition Tracker ("the Service"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Age Requirements</h2>
              <p className="text-gray-700 mb-4">
                The Service is designed for junior football players aged 10-25. Users under 13 must have parental consent and supervision. 
                Parents or guardians are responsible for monitoring their child's use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Provide accurate and complete information during registration</li>
                <li>Keep your account information up to date</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be responsible for all activities that occur under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Permitted Use</h2>
              <p className="text-gray-700 mb-4">
                The Service is provided for personal nutrition tracking and educational purposes. You may not:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Share false or misleading information</li>
                <li>Attempt to gain unauthorized access to other accounts</li>
                <li>Use the Service to harass, abuse, or harm others</li>
                <li>Reverse engineer or attempt to extract the source code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Health Disclaimer</h2>
              <p className="text-gray-700 mb-4">
                <strong>Important:</strong> The Service provides general nutrition tracking and educational content. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers, nutritionists, or sports medicine professionals for personalized advice.
              </p>
              <p className="text-gray-700 mb-4">
                The nutrition recommendations are general guidelines and may not be suitable for all individuals. Users with medical conditions, allergies, or special dietary requirements should consult healthcare professionals.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Coach and Team Features</h2>
              <p className="text-gray-700 mb-4">
                Coaches using the Service agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Use team features responsibly and for legitimate coaching purposes</li>
                <li>Respect player privacy and confidentiality</li>
                <li>Provide appropriate guidance based on age and development</li>
                <li>Not share team access codes with unauthorized individuals</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. 
                By using the Service, you consent to our data practices as described in the Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content, features, and functionality of the Service are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                The Service is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. We will notify users of significant changes. Continued use of the Service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms of Service, please contact us at:
                <br />
                Email: support@juniorfootballnutrition.com
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                By using the Junior Football Nutrition Tracker, you acknowledge that you have read, understood, and agree to these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}