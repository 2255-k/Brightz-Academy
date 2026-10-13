import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, BookOpen, Sparkles, RefreshCw } from 'lucide-react';
import { courseService } from '../services/course.service';
import { Course, TeachingLanguage } from '../types';
import { CourseCard } from '../components/course/CourseCard';

export const CoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [languages, setLanguages] = useState<TeachingLanguage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');

  const currentLang = searchParams.get('language') || 'all';
  const currentLevel = searchParams.get('level') || 'all';

  useEffect(() => {
    courseService.getLanguages().then(setLanguages).catch(console.error);
  }, []);

  const fetchCourses = () => {
    setIsLoading(true);
    const params: any = {};
    if (currentLang && currentLang !== 'all') params.language = currentLang;
    if (currentLevel && currentLevel !== 'all') params.level = currentLevel;
    if (searchQuery.trim()) params.search = searchQuery.trim();

    courseService
      .getCourses(params)
      .then((res) => {
        setCourses(res.results || []);
      })
      .catch((err) => {
        console.error('Failed to fetch courses:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, [currentLang, currentLevel, searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      newParams.set('search', searchQuery.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
    fetchCourses();
  };

  const handleLanguageChange = (code: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (code === 'all') {
      newParams.delete('language');
    } else {
      newParams.set('language', code);
    }
    setSearchParams(newParams);
  };

  const handleLevelChange = (level: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (level === 'all') {
      newParams.delete('level');
    } else {
      newParams.set('level', level);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header Banner */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spoken English Courses</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
            Explore All Courses by Mother Tongue
          </h1>
          <p className="text-sm text-slate-600">
            Find the right self-paced course explained in your preferred mother tongue. Start with foundation phonetics or advance your professional conversation skills.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by topic, grammar, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
            </form>

            {/* Level Quick Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Level:
              </span>
              {[
                { key: 'all', label: 'All Levels' },
                { key: 'foundation', label: 'Foundation' },
                { key: 'beginner', label: 'Beginner' },
                { key: 'intermediate', label: 'Intermediate' },
                { key: 'advanced', label: 'Advanced' },
              ].map((lvl) => (
                <button
                  key={lvl.key}
                  onClick={() => handleLevelChange(lvl.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentLevel === lvl.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language Tabs Row */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 mr-2">Mother Tongue:</span>
            <button
              onClick={() => handleLanguageChange('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                currentLang === 'all'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Languages
            </button>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  currentLang.toLowerCase() === lang.code.toLowerCase()
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lang.name} {lang.native_name && `(${lang.native_name})`}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Showing {courses.length} courses</span>
          {(currentLang !== 'all' || currentLevel !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSearchParams(new URLSearchParams());
                setSearchQuery('');
              }}
              className="text-teal-700 hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No courses match your active criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try selecting a different mother tongue or clearing your search term to see all available offerings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
