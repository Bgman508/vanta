import { FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-8 h-8 text-indigo-500" />
          <h1 className="text-4xl font-light">Terms of Service</h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-neutral-400">Last updated: January 3, 2026</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">1. Acceptance of Terms</h2>
            <p className="text-neutral-300">
              By accessing and using VANTA, you accept and agree to be bound by the terms and provisions of this agreement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">2. Experience-Based Model</h2>
            <p className="text-neutral-300">
              VANTA operates on an experience-first model. When you unlock an experience, you gain permanent access to that specific
              content. This is not a streaming service - there are no per-play royalties or subscription requirements.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">3. User Accounts</h2>
            <p className="text-neutral-300">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility
              for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">4. Artist Content & Revenue</h2>
            <p className="text-neutral-300">
              Artists retain ownership of their content. Revenue splits are determined explicitly and transparently at the time of
              experience creation. All payouts are deterministic and calculated based on the agreed percentage splits.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">5. Prohibited Activities</h2>
            <ul className="list-disc list-inside text-neutral-300 space-y-2">
              <li>Sharing account credentials</li>
              <li>Attempting to download or redistribute content</li>
              <li>Uploading content you don't have rights to</li>
              <li>Harassment or abusive behavior</li>
              <li>Fraudulent payment activities</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">6. Refunds</h2>
            <p className="text-neutral-300">
              Refunds are handled on a case-by-case basis. Once you've accessed an experience, refunds are generally not available
              unless there's a technical issue preventing access.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">7. Content Moderation</h2>
            <p className="text-neutral-300">
              We reserve the right to remove content that violates our guidelines, including but not limited to: copyright infringement,
              hate speech, explicit content without proper warnings, or fraudulent activities.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">8. Limitation of Liability</h2>
            <p className="text-neutral-300">
              VANTA is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential
              damages arising from your use of the platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">9. Changes to Terms</h2>
            <p className="text-neutral-300">
              We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance
              of the new terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-light text-white">10. Contact</h2>
            <p className="text-neutral-300">
              For questions about these terms, please contact us through the platform support system.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}