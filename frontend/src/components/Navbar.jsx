import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Leaf,
  ScanLine,
  BookOpen,
  History,
  Info,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Scan Plant', path: '/scan', icon: ScanLine },
    { name: 'Encyclopedia', path: '/encyclopedia', icon: BookOpen },
    { name: 'Scan History', path: '/history', icon: History, protected: true },
    { name: 'About & Tech', path: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Leaf className="w-5 h-5 fill-white/20" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ring-2 ring-white dark:ring-slate-900">
                +
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 dark:from-emerald-400 dark:via-green-300 dark:to-teal-300 bg-clip-text text-transparent">
                PlantCure<span className="text-emerald-500 font-semibold ml-1">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Crop Health Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              if (link.protected && !isAuthenticated) return null;
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:text-emerald-300 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-500'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Theme Toggle + User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/70 transition-all duration-150"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                    {user?.profile?.profile_photo ? (
                      <img src={user.profile.profile_photo} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(user?.first_name || user?.username || 'U')[0].toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                    {user?.first_name || user?.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:text-emerald-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60 font-medium transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:text-emerald-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60 font-medium transition-colors"
                    >
                      <History className="w-4 h-4 text-slate-400" />
                      Scan Records
                    </Link>
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu and theme buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <nav className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-semibold ${
                isActive('/') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              <Leaf className="w-5 h-5 text-emerald-600" />
              Home
            </Link>
            {navLinks.map((link) => {
              if (link.protected && !isAuthenticated) return null;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-semibold ${
                    isActive(link.path)
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5 text-emerald-600" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-200"
                >
                  <User className="w-5 h-5 text-emerald-600" />
                  My Profile ({user?.first_name || user?.username})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
