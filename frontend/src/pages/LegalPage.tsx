import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, FileText, RefreshCw, Lock, AlertTriangle } from 'lucide-react';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Privacy Policy';
  let icon = ShieldCheck;
  let policyType = 'privacy';

  if (path.includes('terms')) {
    title = 'Terms and Conditions';
    icon = FileText;
    policyType = 'terms';
  } else if (path.includes('refund')) {
    title = 'Refund and Cancellation Policy';
    icon = RefreshCw;
    policyType = 'refund';
  } else if (path.includes('course-access')) {
    title = 'Course Access and Intellectual Property Policy';
    icon = Lock;
    policyType = 'access';
  }

  const IconComponent = icon;

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-200">
            <IconComponent className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading">{title}</h1>
          <p className="text-xs text-slate-500">
            Bright Mindz Academy • Kochi, Kerala, India • Effective Date: October 2026
          </p>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Draft Legal Operational Document</strong>
            <span>
              This policy document represents the academy's operational standard terms for Spoken English training. 
              Final legal certifications should be verified by academy legal counsel prior to formal dispute adjudication.
            </span>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm text-xs text-slate-700 space-y-6 leading-relaxed">
          {policyType === 'privacy' && (
            <>
              <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
              <p>
                Bright Mindz Academy collects minimal personal information necessary to deliver educational services, 
                including your name, email address, phone number, and preferred mother tongue for curriculum delivery.
              </p>

              <h2 className="text-base font-bold text-slate-900">2. Payment Security</h2>
              <p>
                All financial transactions are processed securely through RBI-compliant Indian payment gateways (Razorpay). 
                Bright Mindz Academy does not store, process, or view credit/debit card numbers, CVV codes, or UPI PINs on our servers.
              </p>

              <h2 className="text-base font-bold text-slate-900">3. Video Learning Analytics</h2>
              <p>
                We track individual lesson progress (e.g. timestamps watched and completed lessons) strictly to enable 
                your resume-playback functionality on your student dashboard. We never sell your personal data to third parties.
              </p>

              <h2 className="text-base font-bold text-slate-900">4. Communications</h2>
              <p>
                We may contact you via WhatsApp, SMS, or email regarding your active course enrollments, lesson updates, 
                and administrative announcements.
              </p>
            </>
          )}

          {policyType === 'terms' && (
            <>
              <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p>
                By enrolling in or accessing pre-recorded courses from Bright Mindz Academy, you agree to abide by these terms. 
                Learners of all ages and backgrounds are welcome.
              </p>

              <h2 className="text-base font-bold text-slate-900">2. Non-Guarantee of Results</h2>
              <p>
                Spoken English proficiency is an active motor and mental habit that requires regular vocal practice. 
                While our structured lessons provide proven mother-tongue bridge explanations, we do not make false guarantees 
                of fluency within specific timeframes without student effort.
              </p>

              <h2 className="text-base font-bold text-slate-900">3. Single-User License</h2>
              <p>
                Course enrollment grants a single, non-transferable, personal license to view pre-recorded video lessons 
                for the enrolled student's personal development. Sharing accounts or reselling access is prohibited.
              </p>
            </>
          )}

          {policyType === 'refund' && (
            <>
              <h2 className="text-base font-bold text-slate-900">1. Pre-Recorded Course Access</h2>
              <p>
                Because full curriculum access and downloadable materials are granted immediately upon server payment verification, 
                refunds are evaluated on a case-by-case basis.
              </p>

              <h2 className="text-base font-bold text-slate-900">2. Free Preview Policy</h2>
              <p>
                We provide free trial preview lessons on all our courses so prospective learners can evaluate the trainer's 
                teaching style and mother tongue explanations prior to purchasing.
              </p>

              <h2 className="text-base font-bold text-slate-900">3. Technical Inaccessibility</h2>
              <p>
                If a technical defect on our platform prevents you from viewing your purchased lessons and our support team 
                cannot resolve it within 7 business days, you are eligible for a full refund through the original payment method.
              </p>
            </>
          )}

          {policyType === 'access' && (
            <>
              <h2 className="text-base font-bold text-slate-900">1. Duration of Course Access</h2>
              <p>
                Unless explicitly marked as lifetime access, standard enrollments provide 365 days (one full calendar year) 
                of continuous, on-demand video access from the date of verified payment.
              </p>

              <h2 className="text-base font-bold text-slate-900">2. Intellectual Property Protection</h2>
              <p>
                All video lessons, audio tracks, curriculum structures, and mother tongue pedagogical designs are the proprietary 
                intellectual property of Bright Mindz Academy, Kochi, Kerala. Screen recording, downloading, ripping, or public 
                broadcasting is strictly prohibited.
              </p>

              <h2 className="text-base font-bold text-slate-900">3. Device Compatibility</h2>
              <p>
                Courses are accessible via any modern mobile, tablet, or desktop web browser with high-speed internet connectivity.
              </p>
            </>
          )}
        </div>

        {/* Quick Nav to Other Policies */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500 pt-4">
          <Link to="/privacy-policy" className="hover:text-teal-700">Privacy Policy</Link>
          <span>•</span>
          <Link to="/terms" className="hover:text-teal-700">Terms & Conditions</Link>
          <span>•</span>
          <Link to="/refund-policy" className="hover:text-teal-700">Refund Policy</Link>
          <span>•</span>
          <Link to="/course-access-policy" className="hover:text-teal-700">Course Access Policy</Link>
        </div>
      </div>
    </div>
  );
};
