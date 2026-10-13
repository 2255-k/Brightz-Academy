import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { contentService } from '../services/content.service';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mother_tongue_interest: 'Malayalam',
    subject: 'Course Admissions & Enquiry',
    message: '',
    website_hp: '', // Honeypot field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await contentService.submitEnquiry(formData);
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        mother_tongue_interest: 'Malayalam',
        subject: 'Course Admissions & Enquiry',
        message: '',
        website_hp: '',
      });
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error || 'Could not send your message. Please check the form or contact us via WhatsApp.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 space-y-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Contact Us</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading">
          Get in Touch with Bright Mindz Academy
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Have a question about our pre-recorded lessons or want guidance on choosing your mother tongue course? 
          We are here to help.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column (5 cols): Contact Info & WhatsApp */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                Academy Office
              </h2>
              
              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-xs">Physical Location:</strong>
                    <span>Kochi, Kerala, India — 682001</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Online learning platform serving learners across India</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-xs">Email Enquiries:</strong>
                    <span>info@brightmindzacademy.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 block text-xs">Phone Admissions:</strong>
                    <span>+91 98460 00000</span>
                    <span className="text-[11px] text-slate-400 block">Mon - Sat (9:00 AM - 7:00 PM IST)</span>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp Button */}
              <div className="pt-4 border-t border-slate-100">
                <a
                  href="https://wa.me/919846000000?text=Hello%20Bright%20Mindz%20Academy%2C%20I%20would%20like%20to%20know%20more%20about%20your%20Spoken%20English%20courses."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Direct WhatsApp Chat</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Enquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                Send an Admissions Message
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill out the form below and an academic counselor will reply within 24 hours.
              </p>
            </div>

            {isSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Enquiry Received Successfully!</strong>
                  <span>Thank you for reaching out. Our team will contact you shortly via phone or WhatsApp.</span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Invisible Honeypot Spam Filter Field */}
              <input
                type="text"
                name="website_hp"
                value={formData.website_hp}
                onChange={handleChange}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9846012345"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mother Tongue Interest</label>
                  <select
                    name="mother_tongue_interest"
                    value={formData.mother_tongue_interest}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-xs"
                  >
                    <option value="Malayalam">Malayalam (മലയാളം)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Malayalam Spoken English Course Details"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Your Message / Questions *</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you? Feel free to ask about course duration, levels, or payment options..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 disabled:opacity-75 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Admissions Enquiry</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
