import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle2,
  Lock,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { studentService } from '../services/student.service';
import { PlaybackResponse, Module, Lesson } from '../types';

export const LessonPlayerPage: React.FC = () => {
  const { courseSlug, lessonId } = useParams<{ courseSlug: string; lessonId: string }>();
  const navigate = useNavigate();

  const [curriculumData, setCurriculumData] = useState<{ course: any; modules: Module[] } | null>(null);
  const [playbackData, setPlaybackData] = useState<PlaybackResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentLessonIdNum = Number(lessonId);

  // 1. Fetch Course Curriculum with student's progress checkmarks
  useEffect(() => {
    if (!courseSlug) return;
    studentService
      .getCourseCurriculum(courseSlug)
      .then((data) => {
        setCurriculumData(data);
      })
      .catch((err) => {
        console.error('Failed to load course curriculum:', err);
      });
  }, [courseSlug]);

  // 2. Authorize and load video stream for current lesson
  useEffect(() => {
    if (!currentLessonIdNum) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    studentService
      .getLessonPlayback(currentLessonIdNum)
      .then((data) => {
        if (!isMounted) return;
        setPlaybackData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg = err.response?.data?.error || 'Access denied. You must be enrolled to view this lesson.';
        setError(msg);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentLessonIdNum]);

  // Handle Mark Complete
  const handleMarkComplete = () => {
    if (!currentLessonIdNum) return;
    studentService
      .updateLessonProgress(currentLessonIdNum, {
        last_position_seconds: videoRef.current ? Math.floor(videoRef.current.currentTime) : 0,
        completed: true,
      })
      .then(() => {
        setIsCompleted(true);
        // Refresh curriculum to update checkmarks
        if (courseSlug) {
          studentService.getCourseCurriculum(courseSlug).then(setCurriculumData);
        }
      })
      .catch(console.error);
  };

  // Find Next & Previous Lesson IDs
  const allLessons: Lesson[] = [];
  curriculumData?.modules.forEach((m) => {
    m.lessons.forEach((l) => allLessons.push(l));
  });

  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonIdNum);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="h-16 px-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <div className="hidden sm:block h-4 w-px bg-slate-800"></div>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md font-heading">
              {curriculumData?.course.title || 'Course Player'}
            </h1>
            <p className="text-[10px] text-teal-400">
              {playbackData?.lesson.title || 'Loading lesson...'}
            </p>
          </div>
        </div>

        {/* Next / Previous quick controls */}
        <div className="flex items-center gap-2">
          {prevLesson && (
            <button
              onClick={() => navigate(`/learn/${courseSlug}/${prevLesson.id}`)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>
          )}
          {nextLesson && (
            <button
              onClick={() => navigate(`/learn/${courseSlug}/${nextLesson.id}`)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-xs text-white font-bold rounded-lg flex items-center gap-1 transition-colors"
            >
              <span className="hidden sm:inline">Next Lesson</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left (70%): Streaming Video Player & Lesson Notes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs">Verifying enrollment & generating playback authorization token...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center max-w-md space-y-3">
                <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                <h3 className="text-base font-bold text-white">Playback Access Denied</h3>
                <p className="text-xs text-slate-400">{error}</p>
                <Link
                  to={`/courses/${courseSlug}`}
                  className="inline-block px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold"
                >
                  View Course Details & Enroll
                </Link>
              </div>
            ) : playbackData?.playback?.iframe_url ? (
              <iframe
                src={playbackData.playback.iframe_url}
                className="w-full h-full border-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
                title={playbackData.lesson.title}
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={playbackData?.playback?.stream_url}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                  onEnded={handleMarkComplete}
                />
                {playbackData?.playback?.is_mock_stream && (
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded text-[11px] text-teal-300 border border-teal-500/30 flex items-center gap-1.5 pointer-events-none">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Protected Stream • Verified Playback Token</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lesson Title & Completion Controls */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                {playbackData?.lesson.module_title}
              </span>
              <h2 className="text-xl font-bold text-white font-heading">
                {playbackData?.lesson.title}
              </h2>
              {playbackData?.lesson.description && (
                <p className="text-xs text-slate-400 pt-1 leading-relaxed max-w-xl">
                  {playbackData.lesson.description}
                </p>
              )}
            </div>

            <button
              onClick={handleMarkComplete}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                isCompleted
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Marked Completed' : 'Mark as Complete'}</span>
            </button>
          </div>
        </div>

        {/* Right (30%): Sticky Curriculum Navigation Drawer */}
        <div className="w-full lg:w-96 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
                Course Curriculum
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {allLessons.length} Total Lessons
              </p>
            </div>
            <BookOpen className="w-4 h-4 text-teal-400" />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80">
            {curriculumData?.modules.map((mod) => (
              <div key={mod.id} className="p-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2">
                  Module {mod.position}: {mod.title}
                </span>

                <div className="space-y-1">
                  {mod.lessons.map((les) => {
                    const isActive = les.id === currentLessonIdNum;
                    const isDone = les.progress?.completed || false;

                    return (
                      <button
                        key={les.id}
                        onClick={() => navigate(`/learn/${courseSlug}/${les.id}`)}
                        className={`w-full p-2.5 rounded-xl text-left text-xs flex items-center justify-between gap-3 transition-colors ${
                          isActive
                            ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30'
                            : 'text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0 flex items-center justify-center">
                              {isActive && <div className="w-2 h-2 rounded-full bg-teal-400"></div>}
                            </div>
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>

                        <span className="text-[10px] text-slate-500 shrink-0">
                          {les.formatted_duration}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
