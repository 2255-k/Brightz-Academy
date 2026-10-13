import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X, User as UserIcon, LogOut, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'All Courses', path: '/courses' },
    { name: 'About Us', path: '/about' },
    { name: 'Our Trainers', path: '/trainers' },
    { name: 'FAQs', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top micro-banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 text-white text-xs py-1.5 px-4 text-center border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 font-medium text-teal-300">
            <Sparkles className="w-3.5 h-3.5" /> Kochi, Kerala, India
          </span>
          <span className="hidden sm:inline text-slate-400">•</span>
          <span className="hidden sm:inline text-slate-200">
            Learn Spoken English in Your Mother Tongue (Malayalam, Tamil & Hindi)
          </span>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="glass-nav border-b border-slate-200/80 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg p-1">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-blue-700 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="block text-xl font-extrabold tracking-tight text-slate-900 font-heading">
                Bright Mindz <span className="text-teal-600">Academy</span>
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Spoken English in Mother Tongue
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-teal-700 bg-teal-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right Action / Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-sm font-semibold hover:bg-teal-100 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-teal-600" />
                  <span>{user.first_name || 'My Dashboard'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 rounded-lg shadow-sm shadow-teal-700/20 active:scale-95 transition-all"
                >
                  <span>Explore Courses</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-base font-medium ${
                    isActive ? 'text-teal-700 bg-teal-50 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-teal-50 text-teal-800 font-semibold"
                  >
                    <span>My Dashboard ({user.first_name || user.email})</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 font-medium"
                  >
                    <span>Log Out</span>
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2.5 text-slate-700 font-medium hover:bg-slate-50 rounded-lg"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/courses"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2.5 bg-gradient-to-r from-teal-600 to-blue-700 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Explore Courses
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
