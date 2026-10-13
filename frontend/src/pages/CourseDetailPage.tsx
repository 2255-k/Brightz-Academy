import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  CheckCircle2,
  Play,
  Lock,
  ShieldCheck,
  Globe2,
  Award,
  ChevronDown,
  User as UserIcon,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { courseService } from '../services/course.service';
import { paymentService } from '../services/payment.service';
import { useAuth } from '../context/AuthContext';
import { Course, Module, Lesson } from '../types';
import { VideoPlayerModal } from '../components/course/VideoPlayerModal';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);
  const [activePreviewLessonId, setActivePreviewLessonId] = useState<number | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    courseService
      .getCourseBySlug(slug)
      .then((data) => {
        setCourse(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Error loading course details:', err);
        setError('Course not found or currently unavailable.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]);

  // Handle Enrollment & Razorpay Checkout
  const handleEnrollment = async () => {
    if (!course) return;

    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/courses/${course.slug}`);
      return;
    }

    setIsProcessingCheckout(true);
    setCheckoutError(null);

    try {
      // 1. Create order on Django backend (server calculates price from DB)
      const orderData = await paymentService.createPaymentOrder(course.id);

      // In Sandbox / Mock mode or when Razorpay keys are test placeholders:
      if (orderData.is_mock_sandbox) {
        // Automatically verify in development test mode
        const verifyRes = await paymentService.verifyPayment({
          order_reference: orderData.order_reference,
          razorpay_order_id: orderData.gateway_order_id,
          razorpay_payment_id: `pay_bma_${Date.now()}`,
          razorpay_signature: 'sandbox_test_signature_valid',
        });

        alert(`Payment completed in test sandbox! Access granted for ${course.title}.`);
        navigate('/dashboard');
        return;
      }

      // 2. Load official Razorpay checkout script
      const isLoaded = await paymentService.loadRazorpayScript();
      if (!isLoaded) {
        setCheckoutError('Could not load secure Razorpay gateway. Please check your internet connection.');
        setIsProcessingCheckout(false);
        return;
      }

      // 3. Open official Razorpay Checkout Modal
      const options = {
        key: orderData.key_id,
        amount: orderData.amount_paise,
        currency: orderData.currency,
        name: 'Bright Mindz Academy',
        description: course.title,
        order_id: orderData.gateway_order_id,
        prefill: {
          name: orderData.student.name,
          email: orderData.student.email,
          contact: orderData.student.phone,
        },
        theme: {
          color: '#0d9488', // Teal
        },
        handler: async (response: any) => {
          try {
            await paymentService.verifyPayment({
              order_reference: orderData.order_reference,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate('/dashboard');
          } catch (err: any) {
            setCheckoutError(err.response?.data?.error || 'Payment verification failed on the server.');
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingCheckout(false);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      setCheckoutError(err.response?.data?.error || 'Failed to initiate checkout. Please try again.');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs">Loading course syllabus & details...</span>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen py-24 max-w-lg mx-auto text-center px-4 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Course Not Found</h2>
        <p className="text-xs text-slate-600">{error || 'This course may have been unpublished or removed.'}</p>
        <Link to="/courses" className="inline-block px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold">
          Back to Course Catalogue
        </Link>
      </div>
    );
  }

  const effectivePrice = course.effective_price || course.price;
  const hasDiscount = course.discount_price && course.discount_price < course.price;

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Top Breadcrumb & Hero Header */}
      <div className="bg-slate-900 text-white pt-10 pb-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link to="/courses" className="hover:text-white">Courses</Link>
            <span>/</span>
            <span className="text-teal-400">{course.teaching_language.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold">
              <Globe2 className="w-3.5 h-3.5" /> Medium: {course.teaching_language.name} ({course.teaching_language.native_name})
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold uppercase">
              {course.proficiency_level} Level
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
              Self-Paced Pre-Recorded
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading max-w-4xl">
            {course.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            {course.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>{course.estimated_duration_hours || 12} Hours Total Learning</span>
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span>{course.total_lessons_count || 10} Structured Video Lessons</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-400" />
              <span>{course.access_duration_days ? `${course.access_duration_days} Days Access` : '1 Year Unlimited Access'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Syllabus (Left) vs Checkout / Purchase Card (Right) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Syllabus, Objectives, Trainer */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Learning Objectives Box */}
            {course.learning_objectives && course.learning_objectives.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  What You Will Learn in This Course
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {course.learning_objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Overview & Target Audience */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                Course Description & Teaching Method
              </h2>
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3">
                <p>{course.description}</p>
                {course.target_audience && (
                  <div className="p-4 bg-teal-50/60 border border-teal-200/70 rounded-xl space-y-1">
                    <strong className="text-xs text-teal-900 font-bold block">Who is this course for?</strong>
                    <p className="text-xs text-teal-800">{course.target_audience}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Curriculum Accordion */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-heading">
                    Course Curriculum & Syllabus
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {course.modules?.length || 0} Modules • {course.total_lessons_count} Lessons
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {course.modules && course.modules.map((module, mIdx) => (
                  <div
                    key={module.id}
                    className="border border-slate-200 rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenModuleIndex(openModuleIndex === mIdx ? null : mIdx)}
                      className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/80 text-left flex items-center justify-between gap-4 transition-colors"
                    >
                      <div>
                        <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">
                          Module {module.position}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 font-heading">{module.title}</h3>
                        {module.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{module.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-400">{module.lessons?.length || 0} lessons</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                            openModuleIndex === mIdx ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {openModuleIndex === mIdx && (
                      <div className="divide-y divide-slate-100 bg-white">
                        {module.lessons?.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="px-5 py-3.5 flex items-center justify-between gap-4 text-xs hover:bg-slate-50/70 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.is_preview ? (
                                <button
                                  onClick={() => setActivePreviewLessonId(lesson.id)}
                                  className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 flex items-center justify-center shrink-0 transition-colors"
                                  title="Play Free Preview"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                </button>
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                  <Lock className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-slate-800">{lesson.title}</span>
                                {lesson.description && (
                                  <p className="text-[11px] text-slate-400 line-clamp-1">{lesson.description}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-slate-400 text-[11px]">{lesson.formatted_duration}</span>
                              {lesson.is_preview ? (
                                <button
                                  onClick={() => setActivePreviewLessonId(lesson.id)}
                                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-bold shadow-xs transition-colors"
                                >
                                  Free Trial
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                  Enrolled Only
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Trainer Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
                alt={course.trainer_name}
                className="w-20 h-20 rounded-full object-cover border-2 border-teal-500 shadow-md shrink-0"
              />
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Lead Instructor</span>
                <h3 className="text-lg font-bold text-slate-900 font-heading">{course.trainer_name}</h3>
                <p className="text-xs text-slate-500">{course.trainer_title}</p>
                <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                  Certified English trainer with years of proven track record training adults in Kerala and South India to speak naturally without translation anxiety.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Sticky Enrollment & Checkout Card */}
          <div className="lg:col-span-4 sticky top-28 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl space-y-5">
              
              {/* Thumbnail */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80">
                <img
                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {course.modules?.[0]?.lessons?.[0]?.is_preview && (
                  <button
                    onClick={() => setActivePreviewLessonId(course.modules![0].lessons[0].id)}
                    className="absolute inset-0 bg-black/40 hover:bg-black/50 backdrop-blur-xs flex items-center justify-center gap-2 text-white font-bold text-xs transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                    <span>Watch Preview Lesson</span>
                  </button>
                )}
              </div>

              {/* Pricing Display */}
              <div className="space-y-1 pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 font-heading">
                    ₹{effectivePrice ? Number(effectivePrice).toLocaleString('en-IN') : '1,999'}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{Number(course.price).toLocaleString('en-IN')}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Special Offer
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  One-time payment • All {course.total_lessons_count} video lessons included
                </p>
              </div>

              {/* Checkout Error Alert */}
              {checkoutError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Primary Enrollment Action Button */}
              {course.is_enrolled ? (
                <Link
                  to="/dashboard"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You Are Enrolled • Open Dashboard</span>
                </Link>
              ) : (
                <button
                  onClick={handleEnrollment}
                  disabled={isProcessingCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 disabled:opacity-75 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-700/25 active:scale-95 transition-all"
                >
                  {isProcessingCheckout ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Initializing Secure Checkout...</span>
                    </>
                  ) : (
                    <>
                      <span>Enroll Now — ₹{Number(effectivePrice).toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              )}

              {/* Inclusions Checklist */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <span className="font-bold text-slate-900 block">This course includes:</span>
                <div className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-teal-600" />
                  <span>{course.total_lessons_count} on-demand video lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>365 days of self-paced access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-teal-600" />
                  <span>Access on Mobile, Tablet & PC</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Secure checkout via Razorpay (UPI / Cards)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Preview Video Modal */}
      {activePreviewLessonId && (
        <VideoPlayerModal
          lessonId={activePreviewLessonId}
          isOpen={!!activePreviewLessonId}
          onClose={() => setActivePreviewLessonId(null)}
        />
      )}
    </div>
  );
};
