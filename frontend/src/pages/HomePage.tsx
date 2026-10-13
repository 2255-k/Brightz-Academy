import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Clock,
  Shield,
  Users,
  Star,
  ChevronDown,
  MessageCircle,
  PlayCircle,
  Award,
  Globe2,
} from 'lucide-react';
import { courseService } from '../services/course.service';
import { contentService } from '../services/content.service';
import { Course, Trainer, Testimonial, FAQ } from '../types';
import { CourseCard } from '../components/course/CourseCard';

export const HomePage: React.FC = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      courseService.getCourses({ featured: true }),
      contentService.getTrainers(),
      contentService.getTestimonials(),
      contentService.getFAQs(),
    ])
      .then(([coursesRes, trainersRes, testRes, faqRes]) => {
        if (!isMounted) return;
        setFeaturedCourses(coursesRes.results || []);
        setTrainers(trainersRes || []);
        setTestimonials(testRes || []);
        setFaqs(faqRes || []);
      })
      .catch((err) => {
        console.error('Error loading homepage data:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCourses =
    selectedLanguage === 'all'
      ? featuredCourses
      : featuredCourses.filter(
          (c) => c.teaching_language.code.toLowerCase() === selectedLanguage.toLowerCase()
        );

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-teal-50/60 via-slate-50 to-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/70 border border-teal-200/80 text-teal-900 text-xs font-semibold shadow-sm">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Spoken English Training • Kochi, Kerala</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] font-heading">
                Learn Spoken English in Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-blue-700 to-indigo-800">
                  Mother Tongue.
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Start from the absolute basics and progress towards advanced, confident English. 
                Our structured, pre-recorded video lessons explain grammar and daily conversation 
                step-by-step in <strong>Malayalam</strong>, <strong>Tamil</strong>, and <strong>Hindi</strong>. 
                Learn comfortably at your own pace without the pressure of live schedules.
              </p>

              {/* Welcoming Inclusivity Note */}
              <div className="p-3 bg-white/80 border border-slate-200/80 rounded-xl text-xs text-slate-600 max-w-xl mx-auto lg:mx-0 flex items-center gap-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  <strong>Everyone is welcome:</strong> Students, working professionals, job seekers, and homemakers of all ages and backgrounds.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  to="/courses"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white font-bold text-sm shadow-lg shadow-teal-700/25 active:scale-95 transition-all"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm shadow-sm transition-all"
                >
                  <PlayCircle className="w-4 h-4 text-teal-600" />
                  <span>How It Works</span>
                </a>

                <a
                  href="https://wa.me/919846000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Enquiry</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/60 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">3,500+</div>
                  <div className="text-[11px] font-medium text-slate-500">Learners Enrolled</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-teal-700 font-heading">3+</div>
                  <div className="text-[11px] font-medium text-slate-500">Indian Languages</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">4.9 ★</div>
                  <div className="text-[11px] font-medium text-slate-500">Student Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Hero Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative glow */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-3xl blur-xl opacity-20"></div>

                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/90 bg-white">
                  <div className="aspect-[4/3] overflow-hidden bg-slate-900">
                    <img
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&auto=format&fit=crop&q=80"
                      alt="Bright Mindz Academy Spoken English training in Kochi"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                        Self-Paced Video Curriculum
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> 365 Days Access
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 font-heading">
                      Spoken English Mastery (Malayalam Medium)
                    </h3>

                    <ul className="space-y-2 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Sentence construction explained through Malayalam</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Eliminate hesitation & Mother-Tongue Influence (MTI)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Workplace presentations, job interviews & daily dialogue</span>
                      </li>
                    </ul>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400 line-through">₹3,499</span>
                        <div className="text-2xl font-extrabold text-slate-900 font-heading">₹1,999</div>
                      </div>
                      <Link
                        to="/courses/spoken-english-mastery-malayalam"
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg shadow-sm"
                      >
                        Sample Free Lesson
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MOTHER TONGUE DISCOVERY & FEATURED COURSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Course Catalogue</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            Choose Your Mother Tongue Medium
          </h2>
          <p className="text-sm text-slate-600">
            Select the language you are most comfortable thinking in. Every course features practical spoken drills tailored to your cultural and language context.
          </p>

          {/* Language Selector Filter Tabs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              { code: 'all', label: 'All Languages' },
              { code: 'ml', label: 'Malayalam (മലയാളം)' },
              { code: 'ta', label: 'Tamil (தமிழ்)' },
              { code: 'hi', label: 'Hindi (हिन्दी)' },
            ].map((tab) => (
              <button
                key={tab.code}
                onClick={() => setSelectedLanguage(tab.code)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedLanguage === tab.code
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-slate-200/70 animate-pulse"></div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <Globe2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No courses currently available in this filter.</h3>
            <p className="text-xs text-slate-500 mt-1">Please explore our other mother tongue mediums or view all courses.</p>
          </div>
        )}

        <div className="text-center pt-4">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 underline underline-offset-4"
          >
            <span>View All Courses & Learning Levels</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 3. BENEFITS: WHY LEARN AT YOUR OWN PACE */}
      <section className="bg-slate-900 text-white py-20 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">The Bright Mindz Difference</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
              Why Self-Paced Learning in Your Mother Tongue Works Best
            </h2>
            <p className="text-sm text-slate-400">
              Traditional classrooms often cause anxiety. Our approach removes pressure so your brain can absorb English naturally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Globe2,
                title: 'Mother Tongue Clarity',
                desc: 'Grammar logic is explained in Malayalam, Tamil, or Hindi. No more guessing confusing English rules in English.',
              },
              {
                icon: Clock,
                title: 'No Fixed Batch Timings',
                desc: 'Watch pre-recorded video lessons whenever you want—early morning, during lunch breaks, or late at night.',
              },
              {
                icon: Award,
                title: 'Progressive Levels',
                desc: 'Start with fundamental vowel sounds and pronunciation, moving systematically to advanced office discussions.',
              },
              {
                icon: Shield,
                title: 'Safe, Pressure-Free Practice',
                desc: 'Repeat drills privately without fear of judgment, mockery, or public embarrassment before speaking in public.',
              },
            ].map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-3 card-hover"
                >
                  <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white font-heading">{benefit.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. THE LEARNING JOURNEY: FOUNDATION TO ADVANCED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Roadmap to Fluency</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            Your Step-by-Step Learning Journey
          </h2>
          <p className="text-sm text-slate-600">
            A proven 4-stage progression designed specifically for Indian adults learning English as a second language.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              level: 'Foundation',
              title: 'Sounds & Pronunciation',
              focus: 'Mastering vowels, silent letters, and eliminating mother-tongue accent obstacles.',
            },
            {
              step: '02',
              level: 'Beginner',
              title: 'Daily Conversational Frames',
              focus: 'Ordering food, introducing yourself, shopping, asking directions, and phone etiquette.',
            },
            {
              step: '03',
              level: 'Intermediate',
              title: 'Practical Grammar Mastery',
              focus: 'Using past, present, and future tenses intuitively without memorizing grammar tables.',
            },
            {
              step: '04',
              level: 'Advanced',
              title: 'Workplace & Executive Presence',
              focus: 'Cracking job interviews, giving workplace presentations, and handling corporate calls.',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm space-y-3"
            >
              <div className="text-3xl font-black text-slate-200 font-heading">{item.step}</div>
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-full inline-block">
                {item.level}
              </span>
              <h3 className="text-base font-bold text-slate-900 font-heading">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.focus}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section id="how-it-works" className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Getting Started</span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
              How Bright Mindz Works
            </h2>
            <p className="text-sm text-slate-600">
              Three easy steps to start mastering spoken English from your home today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-teal-600 text-white font-bold text-lg flex items-center justify-center font-heading">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading">Select Your Mother Tongue</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose the course in Malayalam, Tamil, or Hindi that fits your current proficiency level. Sample free preview lessons first.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-teal-600 text-white font-bold text-lg flex items-center justify-center font-heading">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading">Watch Pre-Recorded Lessons</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access bite-sized 15-minute video lessons on your mobile, tablet, or PC anytime. Replay and repeat speaking drills as needed.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-teal-600 text-white font-bold text-lg flex items-center justify-center font-heading">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading">Speak with Daily Confidence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apply real sentence templates in conversations, eliminate hesitations, and advance your career with clear English communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRAINERS SECTION */}
      {trainers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Expert Guidance</span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
              Meet Our Certified Faculty
            </h2>
            <p className="text-sm text-slate-600">
              Experienced language trainers based in Kochi and South India dedicated to compassionate, mother-tongue-oriented learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trainers.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 text-center space-y-4">
                <img
                  src={t.photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'}
                  alt={t.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-teal-50 shadow-md"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">{t.name}</h3>
                  <p className="text-xs font-semibold text-teal-700">{t.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{t.experience_years}+ Years Experience • {t.languages_spoken}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed text-left">
                  {t.bio}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. STUDENT TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="bg-gradient-to-b from-slate-50 to-teal-50/40 py-16 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Learner Stories</span>
              <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
                Experiences from Our Students
              </h2>
              <p className="text-xs text-slate-500 italic">
                *Demo testimonials marked clearly during platform development. Genuine student feedback published with consent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((test) => (
                <div key={test.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-amber-400">
                        {[...Array(test.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      {test.is_demo && (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Demo Preview
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 italic leading-relaxed">
                      "{test.quote}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-900 font-heading">{test.student_name}</h4>
                    <p className="text-[11px] text-slate-500">{test.role_or_location}</p>
                    <span className="text-[11px] text-teal-700 font-medium">
                      Medium: {test.mother_tongue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Got Questions?</span>
          <h2 className="text-3xl font-extrabold text-slate-900 font-heading">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600">
            Clear answers about course access, mother-tongue learning, payments, and refunds.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-bold text-slate-900 font-heading">{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openFaq === index && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. WHATSAPP ENROLMENT CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-700 via-blue-800 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">Start Today</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Ready to Speak Fluent English with Pride?
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Have questions about which course or mother tongue is right for you? 
              Chat directly with our academic team in Kochi, Kerala on WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/courses"
              className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-xs shadow-md transition-all"
            >
              Browse All Courses
            </Link>
            <a
              href="https://wa.me/919846000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
