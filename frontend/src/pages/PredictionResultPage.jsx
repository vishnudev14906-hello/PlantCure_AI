import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Share2,
  Printer,
  Calendar,
  History,
  Info,
  Layers,
  HeartHandshake,
  Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const PredictionResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('organic'); // 'symptoms', 'organic', 'chemical', 'prevention'

  const { result, previewUrl } = location.state || {};

  useEffect(() => {
    if (!result) {
      // If user directly opened /results without data, redirect to scanner
      navigate('/scan', { replace: true });
      return;
    }

    // If leaf is healthy, trigger celebratory confetti!
    if (result.is_healthy) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#16a34a', '#86efac', '#eab308'],
        });
      } catch (err) {
        // Ignored
      }
    }
  }, [result, navigate]);

  if (!result) return null;

  // Outcome B: Invalid / Non-Plant Image
  if (result.is_valid_plant === false) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/60 p-8 sm:p-12 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
              Stage 1 Validation Failed
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {result.error_code === 'DISTANT_LANDSCAPE_DETECTED'
                ? "Distant Landscape / Road Scene Detected"
                : "This doesn't look like a plant part."}
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              {result.detail || "Please upload a photo of a leaf, stem, or root."}
            </p>
            <p className="text-xs text-slate-400">
              {result.tamil_detail || "செல்லுபடியாகாத படம்: தாவர இலை, தண்டு அல்லது வேர் கண்டறியப்படவில்லை"}
            </p>
          </div>

          {previewUrl && (
            <div className="max-w-xs mx-auto aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative">
              <img src={previewUrl} alt="Uploaded Non-Plant Object" className="w-full h-full object-cover filter grayscale contrast-125" />
              <div className="absolute inset-0 bg-red-900/30 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-black/75 text-red-300 text-xs font-mono px-3 py-1.5 rounded-xl border border-red-500/40">
                  Non-Plant Confidence: {100 - (result.validation_score || 0)}%
                </span>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-2 max-w-lg mx-auto text-left">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Why was this image rejected?</p>
            <p className="leading-relaxed">
              {result.reason || "Our Stage 1 Binary MobileNetV2 classifier verifies botanical structures, chlorophyll pigmentation, and tissue cellular patterns before running disease detection. Objects such as people, animals, vehicles, indoor screens, or blank walls are rejected."}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/scan')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again With Plant Photo</span>
            </button>
            <Link
              to="/encyclopedia"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Browse Encyclopedia</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getPlantPartBadge = (part) => {
    switch (part?.toLowerCase()) {
      case 'leaf':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            🌿 Leaf Organ
          </span>
        );
      case 'flower':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-pink-100 dark:bg-pink-950/70 text-pink-800 dark:text-pink-300 border border-pink-300 dark:border-pink-800">
            🌸 Flower / Blossom
          </span>
        );
      case 'fruit':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            🍎 Fruit / Pod
          </span>
        );
      case 'stem':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            🎋 Stem / Stalk Organ
          </span>
        );
      case 'root':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/70 text-orange-900 dark:text-orange-200 border border-orange-300 dark:border-orange-800">
            🪵 Root Organ (வேர்)
          </span>
        );
      case 'seed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
            🌰 Seed / Grain (விதை / தானியம்)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
            🌱 Plant Organ
          </span>
        );
    }
  };

  const getSeverityBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Healthy Plant Organ
          </span>
        );
      case 'mild':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            Mild Severity
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Moderate Severity
          </span>
        );
      case 'severe':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            Severe / High Risk
          </span>
        );
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `PlantCure AI: ${result.predicted_disease_name}`,
        text: `Diagnosed ${result.predicted_disease_name} (${result.plant_part || 'plant'}) with ${result.confidence}% confidence.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `PlantCure AI Diagnosis:\nPlant: ${result.crop}\nOrgan: ${result.plant_part}\nDisease: ${result.predicted_disease_name}\nConfidence: ${result.confidence}%\nTreatment: ${result.organic_treatment}`
      );
      toast.success('Diagnosis summary copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top action navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/scan')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Scan Another Plant</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            aria-label="Share diagnosis"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            aria-label="Print report"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        
        {/* Banner */}
        <div className={`px-6 sm:px-10 py-6 text-white ${
          result.is_healthy
            ? 'bg-gradient-to-r from-emerald-600 to-green-600'
            : result.severity_level === 'severe'
            ? 'bg-gradient-to-r from-red-700 to-amber-700'
            : 'bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                  {result.ai_engine || "Two-Stage AI Diagnostic Report"}
                </span>
                {result.plant_habit && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/25 text-white border border-white/30 backdrop-blur-sm">
                    {result.plant_habit?.toLowerCase().includes('tree') ? '🌳 ' : result.plant_habit?.toLowerCase().includes('shrub') ? '🌹 ' : '🌱 '}
                    {result.plant_habit}
                  </span>
                )}
                {result.is_healthy ? (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-300 text-emerald-950">
                    ✓ Verified Healthy
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-300 text-amber-950">
                    ⚠️ Pathological Distress
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                {result.predicted_disease_name}
              </h1>
              {result.scientific_name && (
                <div className="flex items-center gap-1.5 mt-1 text-emerald-100 font-serif text-sm sm:text-base">
                  <span className="font-sans text-xs uppercase tracking-wider text-emerald-200/90 font-bold not-italic">
                    Botanical Species:
                  </span>
                  <span className="italic font-semibold">
                    {result.scientific_name}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-100 block">
                  Stage 1 Organ
                </span>
                <span className="text-xs font-black text-white capitalize block mt-0.5">
                  {result.plant_part || result.detected_plant_part || 'Leaf'}
                </span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-100 block">
                  AI Confidence
                </span>
                <span className="text-2xl font-black text-white">
                  {result.confidence}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8">

          {/* Executive 4-Metric Diagnostic Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Primary Botanical & Pathology Identification
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                100% Autonomous Recognition
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Real Plant Name */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 shrink-0">
                  {result.plant_habit?.toLowerCase().includes('tree') ? (
                    <span className="text-xl leading-none">🌳</span>
                  ) : result.plant_habit?.toLowerCase().includes('shrub') ? (
                    <span className="text-xl leading-none">🌹</span>
                  ) : (
                    <Leaf className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      1. Real Plant Name
                    </span>
                    {result.plant_habit && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                        {result.plant_habit}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white truncate mt-0.5">
                    {result.crop || 'Plant'}
                  </h3>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    உண்மையான பெயர் ({result.plant_type || 'தாவரம்'})
                  </span>
                </div>
              </div>

              {/* Card 2: Botanical Scientific Name */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-start gap-3.5">
                <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    2. Botanical Name
                  </span>
                  <h3 className="text-base font-bold font-serif italic text-teal-700 dark:text-teal-300 truncate">
                    {result.scientific_name || 'Plantae (Specimen)'}
                  </h3>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                    தாவரவியல் பெயர்
                  </span>
                </div>
              </div>

              {/* Card 3: Health Status */}
              <div className={`p-4 rounded-2xl border shadow-sm flex items-start gap-3.5 ${
                result.is_healthy
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                  : 'bg-red-50/80 dark:bg-red-950/40 border-red-300 dark:border-red-800'
              }`}>
                <div className={`p-3 rounded-xl shrink-0 ${
                  result.is_healthy
                    ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}>
                  {result.is_healthy ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    3. Plant Condition
                  </span>
                  <h3 className={`text-lg font-black truncate ${
                    result.is_healthy ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {result.is_healthy ? 'HEALTHY' : 'DISEASED'}
                  </h3>
                  <span className={`text-[11px] font-semibold ${
                    result.is_healthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {result.is_healthy ? 'ஆரோக்கியமானது ✓' : 'பாதிக்கப்பட்டுள்ளது ⚠️'}
                  </span>
                </div>
              </div>

              {/* Card 4: Name of Disease */}
              <div className={`p-4 rounded-2xl border shadow-sm flex items-start gap-3.5 ${
                result.is_healthy
                  ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
                  : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
              }`}>
                <div className={`p-3 rounded-xl shrink-0 ${
                  result.is_healthy
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                }`}>
                  {result.is_healthy ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    4. Name of Disease
                  </span>
                  <h3 className={`text-base font-black truncate ${
                    result.is_healthy ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'
                  }`}>
                    {result.is_healthy ? 'None (Healthy)' : (result.disease || result.predicted_disease_name)}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    {result.is_healthy ? 'நோய் தொற்று ஏதுமில்லை' : 'கண்டறியப்பட்ட நோய்'}
                  </span>
                </div>
              </div>

            </div>
          </div>
          
          {/* Top details: Image preview + Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Scanned Image */}
            <div className="lg:col-span-5 space-y-3">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 relative shadow-md">
                <img
                  src={previewUrl}
                  alt="Scanned Plant Part"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 px-3 py-1 rounded-lg text-xs font-bold bg-black/70 backdrop-blur-md text-white flex items-center gap-1.5">
                  <span>{result.crop}</span>
                  <span>•</span>
                  <span className="capitalize">{result.plant_part || result.detected_plant_part || 'Leaf'}</span>
                </div>
              </div>

              {/* Status Tags */}
              <div className="flex flex-wrap gap-2 items-center">
                {getPlantPartBadge(result.plant_part || result.detected_plant_part)}
                {getSeverityBadge(result.severity_level)}
                {result.ai_engine && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    {result.ai_engine.includes('Gemini') ? 'Gemini 2.0 Vision' : 'Botanical Engine'}
                  </span>
                )}
                {result.scan_id && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                    <History className="w-3.5 h-3.5" /> Saved to Scan History
                  </span>
                )}
              </div>
            </div>

            {/* Overview & Description */}
            <div className="lg:col-span-7 space-y-4">
              {/* Botanical Details Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Common Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{result.crop}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Scientific Binomial</span>
                  <span className="font-serif italic font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                    {result.scientific_name || 'Plantae'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Plant Organ</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm capitalize">
                    {result.plant_part || result.detected_plant_part || 'Leaf'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Pathology Overview
                </h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  {result.description}
                </p>
              </div>

              {/* Alternative predictions bar */}
              {result.top_predictions && result.top_predictions.length > 1 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Model Confidence Distribution
                  </span>
                  <div className="space-y-2">
                    {result.top_predictions.map((pred, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-700 dark:text-slate-300">
                            {pred.crop} — {pred.disease}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {pred.confidence}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              i === 0 ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                            style={{ width: `${Math.min(pred.confidence, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Treatment & Prevention Tabs */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            
            {/* Tabs Header */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('organic')}
                className={`pb-3 px-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'organic'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Organic Treatments</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('chemical')}
                className={`pb-3 px-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'chemical'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Chemical Controls</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('symptoms')}
                className={`pb-3 px-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'symptoms'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Visual Symptoms</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('prevention')}
                className={`pb-3 px-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                  activeTab === 'prevention'
                    ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Prevention Guidelines</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-2">
              
              {activeTab === 'organic' && (
                <div className="p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-base">
                    <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>Bio-Friendly & Organic Remedies</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {result.organic_treatment}
                  </p>
                </div>
              )}

              {activeTab === 'chemical' && (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-base">
                    <Layers className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <span>Targeted Chemical Treatments & Fungicides</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {result.chemical_treatment}
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    Always follow label directions, safety precautions, and personal protective equipment (PPE) guidelines when applying agricultural chemicals.
                  </p>
                </div>
              )}

              {activeTab === 'symptoms' && (
                <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-base">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span>Identified Visual Leaf Symptoms</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {result.symptoms}
                  </p>
                </div>
              )}

              {activeTab === 'prevention' && (
                <div className="p-6 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-base">
                    <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Long-Term Cultural & Preventive Practices</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {result.prevention_tips}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/scan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Diagnose Another Plant Part</span>
            </Link>

            {isAuthenticated ? (
              <Link
                to="/history"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <History className="w-4 h-4 text-emerald-500" />
                <span>View In Scan History</span>
              </Link>
            ) : (
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Create Account to Track History</span>
              </Link>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
