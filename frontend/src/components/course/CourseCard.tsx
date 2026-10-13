import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { Course } from '../../types';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const levelLabels: Record<string, { label: string; color: string }> = {
    foundation: { label: 'Foundation', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    beginner: { label: 'Beginner', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    intermediate: { label: 'Intermediate', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    advanced: { label: 'Advanced', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  const levelInfo = levelLabels[course.proficiency_level] || {
    label: course.proficiency_level,
    color: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const hasDiscount = course.discount_price && course.discount_price < course.price;
  const effectivePrice = course.effective_price || (hasDiscount ? course.discount_price : course.price);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm card-hover flex flex-col justify-between">
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={course.thumbnail_url || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Language Badge */}
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          <span>{course.teaching_language.name}</span>
          {course.teaching_language.native_name && (
            <span className="text-teal-300 font-normal">({course.teaching_language.native_name})</span>
          )}
        </div>

        {/* Level Badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${levelInfo.color} shadow-sm backdrop-blur-md`}>
            {levelInfo.label}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug font-heading">
            {course.title}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {course.subtitle}
          </p>
        </div>

        {/* Meta Stats */}
        <div className="pt-4 mt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-3">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.estimated_duration_hours || 12} hrs total</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.total_lessons_count || 10} lessons</span>
            </span>
          </div>

          {/* Pricing & CTA Row */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 font-heading">
                  ₹{effectivePrice ? Number(effectivePrice).toLocaleString('en-IN') : '1,999'}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{Number(course.price).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-teal-700 font-medium block">
                {course.access_duration_days ? `${course.access_duration_days} Days Access` : '1 Year Unlimited Access'}
              </span>
            </div>

            <Link
              to={`/courses/${course.slug}`}
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm group-hover:shadow-teal-600/20 active:scale-95 transition-all"
            >
              <span>View Course</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
