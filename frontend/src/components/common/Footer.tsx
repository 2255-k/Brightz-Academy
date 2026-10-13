import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Mail, Phone, MessageCircle, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-heading">
                Bright Mindz <span className="text-teal-400">Academy</span>
              </span>
            </Link>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering learners across Kerala and India to speak English with confidence. 
              Our structured, self-paced pre-recorded lessons break language barriers by teaching 
              practical English explained clearly in your own mother tongue.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Kochi, Kerala, India — 682001</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>info@brightmindzacademy.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+91 98460 00000 (Student Admissions)</span>
              </div>
            </div>
          </div>

          {/* Col 3: Languages & Mediums */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              Mother Tongues
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/courses?language=ml" className="hover:text-teal-300 transition-colors">
                  Malayalam Medium (മലയാളം)
                </Link>
              </li>
              <li>
                <Link to="/courses?language=ta" className="hover:text-teal-300 transition-colors">
                  Tamil Medium (தமிழ்)
                </Link>
              </li>
              <li>
                <Link to="/courses?language=hi" className="hover:text-teal-300 transition-colors">
                  Hindi Medium (हिन्दी)
                </Link>
              </li>
              <li>
                <Link to="/courses?language=kn" className="hover:text-teal-300 transition-colors">
                  Kannada Medium (ಕನ್ನಡ)
                </Link>
              </li>
              <li>
                <Link to="/courses?language=te" className="hover:text-teal-300 transition-colors">
                  Telugu Medium (తెలుగు)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/courses" className="hover:text-teal-300 transition-colors">Browse All Courses</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-teal-300 transition-colors">Our Teaching Philosophy</Link>
              </li>
              <li>
                <Link to="/trainers" className="hover:text-teal-300 transition-colors">Meet Our Trainers</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-teal-300 transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-teal-300 transition-colors">Admissions & Contact</Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Policies & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              Policies & Support
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/privacy-policy" className="hover:text-teal-300 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-teal-300 transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-teal-300 transition-colors">Refund & Cancellation</Link>
              </li>
              <li>
                <Link to="/course-access-policy" className="hover:text-teal-300 transition-colors">Course Access Policy</Link>
              </li>
              <li className="pt-2">
                <a
                  href="https://wa.me/919846000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Support</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ethical Education Disclaimer */}
        <div className="pt-8 text-xs text-slate-400 leading-relaxed border-b border-slate-800 pb-6">
          <p>
            <strong className="text-slate-300">Academic Disclaimer:</strong> Bright Mindz Academy provides self-paced, pre-recorded Spoken English courses designed to develop practical conversational confidence, grammar accuracy, and clear pronunciation. We do not make unrealistic promises of guaranteed fluency or instant overnight mastery. Language acquisition requires regular viewing, active vocal practice, and consistent personal effort.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Bright Mindz Academy. All rights reserved. Kochi, Kerala, India.</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Secure Indian Payment Gateway by Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
