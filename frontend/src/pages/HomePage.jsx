import React from 'react';
import { Link } from 'react-router-dom';
import {
  ScanLine,
  ShieldCheck,
  Zap,
  BookOpen,
  Sprout,
  ArrowRight,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
  Search
} from 'lucide-react';
import { SAMPLE_LEAVES } from '../data/sampleLeaves';

export const HomePage = () => {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-16 pb-12 sm:pb-20">
        {/* Background decorative blur shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-500/10 via-green-400/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-sm animate-pulse-subtle">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Two-Stage AI Pipeline: Plant Part Validation & Disease Detection</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Protect Your Crops With{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-600 dark:from-emerald-400 dark:via-green-300 dark:to-teal-300 bg-clip-text text-transparent">
                  Instant AI Plant Diagnosis
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Upload a photo of any plant part (leaf, stem, root, flower, fruit, or seed). Our Stage 1 validator verifies authentic plant tissue, and Stage 2 deep learning diagnoses diseases with organic &amp; chemical treatments in seconds.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/scan"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  <ScanLine className="w-5 h-5" />
                  <span>Scan Plant Part Now</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/encyclopedia"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Explore Encyclopedia</span>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>All Plant Organs Supported (Leaves, Stems, Roots, Flowers, Fruits &amp; Seeds)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Two-Stage AI Validation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Organic & Chemical Solutions</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl p-4 bg-gradient-to-b from-emerald-500/20 via-slate-100 to-transparent dark:from-emerald-500/10 dark:via-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                
                {/* Floating status tag */}
                <div className="absolute -top-3 -right-3 z-10 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold text-xs shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 animate-bounce">
                  <Activity className="w-3.5 h-3.5" />
                  <span>96.4% Confidence</span>
                </div>

                <div className="rounded-2xl overflow-hidden bg-slate-950 relative aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=800&auto=format&fit=crop&q=80"
                    alt="Diagnosed Tomato Leaf"
                    className="w-full h-full object-cover opacity-90"
                  />
                  
                  {/* Scanner overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-emerald-950/80" />
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-xs text-emerald-300 font-mono">
                    <span>TARGET: Solanum lycopersicum</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      ANALYZING
                    </span>
                  </div>

                  {/* Recognition Box */}
                  <div className="absolute inset-x-8 top-10 bottom-16 border-2 border-emerald-400/80 rounded-xl border-dashed flex items-center justify-center">
                    <div className="bg-black/60 backdrop-blur-sm text-emerald-200 text-xs px-3 py-1 rounded-full font-mono">
                      Early Blight Lesions Detected
                    </div>
                  </div>

                  {/* Result Bar */}
                  <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Diagnosis Result</p>
                      <p className="text-sm font-bold text-emerald-400">Tomato Early Blight</p>
                    </div>
                    <Link
                      to="/scan"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold transition-colors"
                    >
                      Try It
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Key Metrics Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">92.4%+</p>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Validation Accuracy</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">40+</p>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Crop & Part Conditions</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">&lt; 150ms</p>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Neural Inference Speed</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">100%</p>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Organic Remedies Included</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Three Simple Steps to Healthy Crops
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            From botanical plant part validation to organic remedies in three seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-5">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Upload Plant Photo (Any Plant Organ)
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Drag and drop an image or snap with your camera. Autonomously recognizes leaves, stems, roots, flowers, fruits, and seeds.
            </p>
          </div>

          <div className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-5">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Two-Stage MobileNetV2 Inference
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Stage 1 validates authentic botanical tissue (&gt;70% threshold). Stage 2 identifies microscopic foliar lesions, stem cankers, or root rot in real time.
            </p>
          </div>

          <div className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-5">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Organ-Specific Treatment & Care
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Receive step-by-step organic remedies, targeted fungicides, soil aeration tips, and cultural practices tailored for that exact plant organ.
            </p>
          </div>

        </div>
      </section>

      {/* Instant 1-Click Test Samples */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Try It Immediately
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Instant Sample Leaf Tests
            </h2>
          </div>
          <Link
            to="/scan"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Open Custom Image Uploader</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SAMPLE_LEAVES.map((sample) => (
            <div
              key={sample.id}
              className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={sample.url}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md text-xs font-bold bg-black/60 text-white backdrop-blur-md">
                  {sample.crop}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">
                  {sample.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {sample.hint}
                </p>
                <div className="pt-2">
                  <Link
                    to={`/scan?sample=${sample.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                    <span>Diagnose This Leaf</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 plant-gradient text-white shadow-xl shadow-emerald-900/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Ready to Protect Your Harvest?
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Create a free account to track your past plant scans, store crop logs in SQLite, and stay ahead of foliar, stem, and root disease outbreaks.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              to="/signup"
              className="px-6 py-3 rounded-xl font-bold text-emerald-900 bg-white hover:bg-emerald-50 shadow-md transition-all text-center"
            >
              Create Free Account
            </Link>
            <Link
              to="/scan"
              className="px-6 py-3 rounded-xl font-bold text-white bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-500/50 transition-all text-center"
            >
              Scan Without Account
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
