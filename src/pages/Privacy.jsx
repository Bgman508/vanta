import { Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-indigo-500" />
          <h1 className="text-4xl font-light">Privacy Policy</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-neutral-400">Last updated: January 3, 2026</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">1. Information We Collect</h2>
            <p className="text-neutral-300">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2">
              <li>Account information (email, name, profile details)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Content you create (experiences, comments, reviews)</li>
              <li>Usage data (experiences unlocked, favorites, follows)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">2. How We Use Your Information</h2>
            <p className="text-neutral-300">We use collected information to:</p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2">
              <li>Provide and improve our services</li>
              <li>Process payments and manage your account</li>
              <li>Send notifications about followed artists and new releases</li>
              <li>Personalize your experience and recommendations</li>
              <li>Detect and prevent fraud</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">3. Information Sharing</h2>
            <p className="text-neutral-300">
              We do not sell your personal information. We share information only:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>With service providers (e.g., payment processors)</li>
              <li>In aggregated, anonymized form for analytics</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">4. Data Security</h2>
            <p className="text-neutral-300">
              We implement industry-standard security measures to protect your data, including encryption, secure authentication,
              and regular security audits.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">5. Your Rights</h2>
            <p className="text-neutral-300">You have the right to:</p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">6. Cookies & Tracking</h2>
            <p className="text-neutral-300">
              We use cookies and similar technologies to maintain your session, remember your preferences, and analyze platform usage.
              You can control cookie settings through your browser.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">7. Children's Privacy</h2>
            <p className="text-neutral-300">
              VANTA is not intended for users under 13 years of age. We do not knowingly collect information from children under 13.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">8. International Users</h2>
            <p className="text-neutral-300">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards
              are in place for international data transfers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">9. Changes to This Policy</h2>
            <p className="text-neutral-300">
              We may update this privacy policy from time to time. We will notify you of significant changes via email or platform
              notification.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">10. Contact Us</h2>
            <p className="text-neutral-300">
              For privacy-related questions or to exercise your rights, contact us through the platform support system.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}