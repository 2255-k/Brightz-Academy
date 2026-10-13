import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, MessageCircle, HelpCircle } from 'lucide-react';
import { contentService } from '../services/content.service';
import { FAQ } from '../types';

export const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    contentService
      .getFAQs()
      .then((data) => setFaqs(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-16 space-y-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help & Support</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Everything you need to know about our mother-tongue Spoken English methodology, course access, payments, and devices.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs (e.g., payments, mobile, Malayalam)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { key: 'all', label: 'All Categories' },
            { key: 'general', label: 'Mother Tongue Approach' },
            { key: 'courses', label: 'Courses & Video Access' },
            { key: 'payments', label: 'Payments & Refunds' },
            { key: 'technical', label: 'Technical & Devices' },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-16 rounded-xl bg-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-bold text-slate-900 font-heading">{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-xs text-slate-500">No matching questions found.</p>
          </div>
        )}

        {/* WhatsApp Card */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 mt-8">
          <h3 className="text-sm font-bold text-emerald-950 font-heading">
            Still have a question?
          </h3>
          <p className="text-xs text-emerald-800 max-w-sm mx-auto">
            Our student admissions team in Kochi is available on WhatsApp to answer your specific queries.
          </p>
          <a
            href="https://wa.me/919846000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
