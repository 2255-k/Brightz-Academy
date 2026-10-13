import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  CreditCard,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { studentService } from '../services/student.service';
import { paymentService } from '../services/payment.service';
import { useAuth } from '../context/AuthContext';
import { StudentDashboardData, OrderRecord } from '../types';

export const StudentDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'orders' | 'profile'>('courses');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = () => {
    setIsLoading(true);
    Promise.all([
      studentService.getDashboard(),
      paymentService.getOrderHistory(),
    ])
      .then(([dashRes, ordersRes]) => {
        setDashboardData(dashRes);
        setOrders(ordersRes);
      })
      .catch((err) => {
        console.error('Error fetching student dashboard:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Top Welcome Banner */}
      <div className="bg-slate-900 text-white pt-10 pb-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Learning Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                Welcome back, {user?.first_name || user?.username}!
              </h1>
              <p className="text-xs text-slate-400">
                Preferred Teaching Language:{' '}
                <span className="text-teal-300 font-semibold capitalize">
                  {user?.preferred_language || 'Malayalam'}
                </span>{' '}
                • {user?.email}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/courses"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Browse More Courses
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-8 border-t border-slate-800/80 mt-8">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'courses'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              My Enrolled Courses ({dashboardData?.enrolled_courses.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Order & Payment History ({orders.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500">Loading your learning records...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: COURSES & CONTINUE LEARNING */}
            {activeTab === 'courses' && (
              <div className="space-y-8">
                {/* Continue Learning Banner */}
                {dashboardData?.continue_learning && (
                  <div className="bg-gradient-to-r from-teal-800 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1 max-w-2xl">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                        Continue Where You Left Off
                      </span>
                      <h2 className="text-xl font-bold font-heading text-white">
                        {dashboardData.continue_learning.lesson_title}
                      </h2>
                      <p className="text-xs text-slate-300">
                        Course: {dashboardData.continue_learning.course_title} • Module:{' '}
                        {dashboardData.continue_learning.module_title}
                      </p>
                    </div>

                    <Link
                      to={`/learn/${dashboardData.continue_learning.course_slug}/${dashboardData.continue_learning.lesson_id}`}
                      className="px-6 py-3 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-all shrink-0"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Resume Lesson</span>
                    </Link>
                  </div>
                )}

                {/* Enrolled Courses Grid */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Active Course Enrollments
                  </h3>

                  {dashboardData?.enrolled_courses && dashboardData.enrolled_courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dashboardData.enrolled_courses.map((course) => {
                        const progress = course.progress_percentage || 0;
                        const firstLessonId = course.next_lesson?.id || 1;

                        return (
                          <div
                            key={course.id}
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                                <img
                                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                                  {course.teaching_language.name} Medium
                                </span>
                                <h4 className="text-base font-bold text-slate-900 font-heading mt-1.5 line-clamp-1">
                                  {course.title}
                                </h4>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{course.subtitle}</p>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-slate-600">Course Progress</span>
                                <span className="text-teal-700">{progress}%</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>

                              <Link
                                to={`/learn/${course.slug}/${firstLessonId}`}
                                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors mt-3"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Go to Course Player</span>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                      <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                      <h3 className="text-base font-bold text-slate-800">You are not enrolled in any courses yet</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Explore our catalogue of mother-tongue Spoken English courses and begin learning today.
                      </p>
                      <Link
                        to="/courses"
                        className="inline-block px-5 py-2.5 bg-teal-600 text-white text-xs font-bold rounded-xl shadow-sm"
                      >
                        Browse Courses
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ORDER & TRANSACTION HISTORY */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Transaction & Order Records
                  </h3>
                  <p className="text-xs text-slate-500">
                    All transactions are verified through the secure Razorpay payment gateway.
                  </p>
                </div>

                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3">Order Ref</th>
                          <th className="px-6 py-3">Course</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.map((ord, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="px-6 py-4 font-mono font-medium text-slate-900">
                              #{ord.order_reference.slice(0, 8)}...
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-800">
                              {ord.course_title}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-900">
                              ₹{Number(ord.amount).toLocaleString('en-IN')}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  ord.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400">
                              {new Date(ord.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No payment orders recorded yet.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
