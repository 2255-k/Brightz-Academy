import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, Heart, Globe2, BookOpen, Users, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 space-y-20">
      {/* Header Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Story & Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading">
          Empowering India Through English in Your Mother Tongue
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Headquartered in Kochi, Kerala, Bright Mindz Academy was founded on a simple, compassionate conviction: 
          anyone can master confident English communication when explained through their own mother tongue.
        </p>
      </section>

      {/* Main Philosophy Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">The Problem We Solve</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
              Why Traditional English Teaching Fails Most Adults
            </h2>
            <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
              <p>
                In conventional language institutes, teachers try to explain complex English grammar rules using English itself. 
                For someone already anxious about the language, this creates confusion and mental paralysis. Learners end up 
                mentally translating word-by-word from Malayalam, Tamil, or Hindi before opening their mouths.
              </p>
              <p>
                At <strong>Bright Mindz Academy</strong>, we discard that outdated model. When a concept is explained clearly 
                in your mother tongue, your brain grasps the intent immediately. We then teach you the exact sentence template 
                to express that thought in English without translating word-for-word.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {[
                'Start from comfort: Grammar explained in your native language',
                'Learn at your own pace without scheduled live classroom pressure',
                'Eliminate Mother-Tongue Influence (MTI) with phonetic drills',
                'Zero judgment: Learners of all educational backgrounds welcome',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&auto=format&fit=crop&q=80"
              alt="Bright Mindz Academy Classroom and Learning"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-slate-900 text-white py-16 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Our Core Beliefs</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Guiding Principles of Bright Mindz Academy
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <Globe2 className="w-8 h-8 text-teal-400" />
              <h4 className="text-base font-bold text-white font-heading">Mother Tongue as a Bridge</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your mother tongue is not an obstacle to be ashamed of; it is your greatest strength for understanding linguistics and syntax.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <Users className="w-8 h-8 text-teal-400" />
              <h4 className="text-base font-bold text-white font-heading">Radical Accessibility</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We design courses so that even individuals who are not tech-savvy can navigate lessons effortlessly on simple smartphones.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
              <Heart className="w-8 h-8 text-teal-400" />
              <h4 className="text-base font-bold text-white font-heading">Ethical Transparency</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We never promise fake "fluency in 7 days." Real spoken communication is a skill built through honest guidance and steady daily practice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kochi Kerala Location Note & CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h3 className="text-2xl font-bold text-slate-900 font-heading">
          Proudly Rooted in Kochi, Kerala
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          From our academic hub in Kochi, we serve students from all 14 districts of Kerala, Tamil Nadu, 
          and pan-India, delivering pre-recorded excellence right to your screen.
        </p>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
        >
          <span>Explore Mother Tongue Courses</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
};
