import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Leaf className="w-5 h-5 fill-white/20" />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-teal-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow ring-1 ring-slate-900">
                  +
                </span>
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                PlantCure<span className="text-emerald-400 ml-1">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Empowering farmers, agricultural extension workers, and garden enthusiasts with instant two-stage MobileNetV2 plant part validation & disease diagnosis (leaves, stems, roots), organic remedies, and preventative crop management.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5" /> Two-Stage CNN
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-800/60">
                <Sparkles className="w-3.5 h-3.5" /> MobileNetV2
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/scan" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Instant Plant Scanner
                </Link>
              </li>
              <li>
                <Link to="/encyclopedia" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Disease Encyclopedia
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Diagnostic History
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Two-Stage Architecture & Tech
                </Link>
              </li>
            </ul>
          </div>

          {/* Agricultural Disclaimer */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Field Guidance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              PlantCure AI provides computer-vision-assisted advisory predictions. For high-acreage commercial farming or severe infestations, always cross-reference with local agricultural extension offices.
            </p>
            <p className="text-xs text-slate-500 pt-2">
              SQLite + Django REST Framework + React JS + TensorFlow
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PlantCure AI. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Cultivated with precision for sustainable agriculture</span>
            <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
