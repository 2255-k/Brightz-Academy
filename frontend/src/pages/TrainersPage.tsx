import React, { useState, useEffect } from 'react';
import { Sparkles, Award, Globe2, BookOpen } from 'lucide-react';
import { contentService } from '../services/content.service';
import { Trainer } from '../types';

export const TrainersPage: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    contentService
      .getTrainers()
      .then((data) => setTrainers(data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-16 space-y-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Faculty</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading">
          Meet Our Certified Spoken English Trainers
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Every Bright Mindz instructor brings extensive classroom and corporate communication experience, 
          specializing in mother-tongue bridge methodologies for Indian learners.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trainers.map((trainer) => (
              <div
                key={trainer.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 text-center space-y-5 card-hover"
              >
                <div className="relative w-28 h-28 mx-auto">
                  <img
                    src={trainer.photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'}
                    alt={trainer.name}
                    className="w-full h-full rounded-full object-cover border-4 border-teal-50 shadow-md"
                  />
                  <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm">
                    <Award className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900 font-heading">{trainer.name}</h3>
                  <p className="text-xs font-semibold text-teal-700">{trainer.title}</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {trainer.experience_years}+ Years Pedagogy Experience
                  </p>
                </div>

                <div className="py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-center justify-center gap-2">
                  <Globe2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Languages: {trainer.languages_spoken}</span>
                </div>

                <p className="text-xs text-slate-600 text-left leading-relaxed">
                  {trainer.bio}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
