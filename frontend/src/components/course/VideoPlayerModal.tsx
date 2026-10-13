import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Volume2, VolumeX, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';
import { studentService } from '../../services/student.service';
import { PlaybackResponse } from '../../types';

interface VideoPlayerModalProps {
  lessonId: number;
  isOpen: boolean;
  onClose: () => void;
  onLessonCompleted?: (lessonId: number) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  lessonId,
  isOpen,
  onClose,
  onLessonCompleted,
}) => {
  const [playbackData, setPlaybackData] = useState<PlaybackResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progressSeconds, setProgressSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isOpen || !lessonId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    studentService
      .getLessonPlayback(lessonId)
      .then((data) => {
        if (!isMounted) return;
        setPlaybackData(data);
        setProgressSeconds(data.last_position_seconds || 0);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg = err.response?.data?.error || 'Could not authorize video playback. Please try again.';
        setError(msg);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lessonId, isOpen]);

  // Sync initial playback position once video is loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (playbackData?.last_position_seconds) {
        videoRef.current.currentTime = playbackData.last_position_seconds;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = Math.floor(videoRef.current.currentTime);
      setProgressSeconds(current);

      // If user reaches 90% of lesson, automatically trigger completion
      if (duration > 0 && current / duration > 0.9 && !hasCompleted) {
        setHasCompleted(true);
        studentService
          .updateLessonProgress(lessonId, { last_position_seconds: current, completed: true })
          .then(() => onLessonCompleted?.(lessonId))
          .catch(() => {});
      }
    }
  };

  const handleSaveProgress = () => {
    if (videoRef.current) {
      const current = Math.floor(videoRef.current.currentTime);
      studentService.updateLessonProgress(lessonId, { last_position_seconds: current }).catch(() => {});
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        handleSaveProgress();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                {playbackData?.is_preview ? 'Free Preview Lesson' : 'Protected Curriculum'}
              </span>
              <span className="text-xs text-slate-400">{playbackData?.lesson.module_title}</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              {playbackData?.lesson.title || 'Loading Lesson Video...'}
            </h3>
          </div>
          <button
            onClick={() => {
              handleSaveProgress();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Area */}
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs">Verifying authorization & loading playback stream...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">Access Restricted</h4>
              <p className="text-xs text-slate-400 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
              >
                Close Player
              </button>
            </div>
          ) : playbackData?.playback?.iframe_url ? (
            /* Cloudflare or Bunny Stream Iframe Player */
            <iframe
              src={playbackData.playback.iframe_url}
              className="w-full h-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              title={playbackData.lesson.title}
            />
          ) : (
            /* HTML5 Player for Development Mock Streaming with Server-Verified Tokens */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={playbackData?.playback?.stream_url}
                className="w-full h-full object-contain"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => {
                  setIsPlaying(false);
                  setHasCompleted(true);
                  studentService.updateLessonProgress(lessonId, { completed: true });
                  onLessonCompleted?.(lessonId);
                }}
                playsInline
              />

              {/* Development Watermark Tag */}
              {playbackData?.playback?.is_mock_stream && (
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded text-[11px] text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Authorized Dev Stream (Token Verified)</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer controls & lesson description */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            {!playbackData?.playback?.iframe_url && !isLoading && !error && (
              <button
                onClick={togglePlay}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play Video'}</span>
              </button>
            )}
            <span>
              Position: {Math.floor(progressSeconds / 60)}:
              {('0' + (progressSeconds % 60)).slice(-2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasCompleted && (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle className="w-4 h-4" /> Marked Completed
              </span>
            )}
            <button
              onClick={() => {
                setHasCompleted(true);
                studentService.updateLessonProgress(lessonId, { completed: true });
                onLessonCompleted?.(lessonId);
              }}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
            >
              Mark Lesson as Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
