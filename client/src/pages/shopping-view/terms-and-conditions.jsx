function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
        }
      `}</style>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Terms and Conditions
        </h1>

        <div className="space-y-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using Asal Pasal's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
            <p className="leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials on Asal Pasal's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on Asal Pasal's website</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Product Information</h2>
            <p className="leading-relaxed">
              We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions or other content on this site is accurate, complete, reliable, current, or error-free. If a product offered by Asal Pasal is not as described, your sole remedy is to return it in unused condition.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Pricing and Payment</h2>
            <p className="leading-relaxed">
              All prices are subject to change without notice. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in product information, or payment issues. Payment must be received in full before order processing begins.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Shipping and Delivery</h2>
            <p className="leading-relaxed">
              We offer shipping services across Nepal. Delivery times may vary based on location and product availability. We are not responsible for delays caused by factors beyond our control, including but not limited to weather, carrier delays, or postal service issues.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Returns and Refunds</h2>
            <p className="leading-relaxed">
              Items may be returned within 7 days of delivery for a full refund, provided they are in original condition and packaging. Return shipping costs are the responsibility of the customer unless the item was damaged or incorrect. Refunds will be processed within 5-7 business days after receipt of returned items.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Privacy Policy</h2>
            <p className="leading-relaxed">
              Your privacy is important to us. We collect personal information necessary to process orders and improve our services. We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. User Account</h2>
            <p className="leading-relaxed">
              When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Prohibited Uses</h2>
            <p className="leading-relaxed mb-4">
              You may not use our products or services:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
            <p className="leading-relaxed">
              In no event shall Asal Pasal or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Asal Pasal's website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Governing Law</h2>
            <p className="leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of Nepal, and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Information</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at asalpasal@gmail.com or call +977-1-1234567.
            </p>
          </section>

          <div className="text-center pt-8 border-t border-slate-700">
            <p className="text-slate-400 text-sm">
              Last updated: December 25, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditionsPage;