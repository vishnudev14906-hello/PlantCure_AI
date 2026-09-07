import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Leaf,
  XCircle,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Camera
} from 'lucide-react';
import { SAMPLE_LEAVES } from '../data/sampleLeaves';

export const UploadPredictPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('auto');
  const [selectedPlantPart, setSelectedPlantPart] = useState('auto');
  const [isDragging, setIsDragging] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionStep, setPredictionStep] = useState(0);
  const [notes, setNotes] = useState('');
  const [invalidImageError, setInvalidImageError] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Check if sample leaf was passed via query parameter
  useEffect(() => {
    const sampleId = searchParams.get('sample');
    if (sampleId) {
      const sample = SAMPLE_LEAVES.find((s) => s.id === sampleId);
      if (sample) {
        handleSelectSample(sample);
      }
    }
  }, [searchParams]);

  // Two-stage loading step simulation during ML prediction
  useEffect(() => {
    let interval;
    if (isPredicting) {
      setPredictionStep(1);
      interval = setInterval(() => {
        setPredictionStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 650);
    } else {
      setPredictionStep(0);
    }
    return () => clearInterval(interval);
  }, [isPredicting]);

  const handleFileChange = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image file too large. Maximum size is 15MB.');
      return;
    }

    setInvalidImageError(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    toast.info('Image selected. Ready to diagnose!');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = async (sample) => {
    try {
      setInvalidImageError(null);
      toast.info(`Loading ${sample.name} sample...`);
      const response = await fetch(sample.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch (${response.status})`);
      }
      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Fetched file is empty (0 bytes).');
      }
      const file = new File([blob], `${sample.id}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(sample.url);
      setNotes(`Sample test: ${sample.name}`);
      toast.success(`${sample.name} loaded! Ready to diagnose.`);
    } catch (err) {
      console.error('Sample loading error:', err);
      toast.error(`Could not load sample image: ${err.message}`);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setNotes('');
    setInvalidImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || selectedFile.size === 0) {
      toast.error('Please choose or drop a valid plant part image first (cannot be empty).');
      return;
    }

    setInvalidImageError(null);
    setIsPredicting(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (selectedCrop && selectedCrop !== 'auto') {
        formData.append('crop', selectedCrop);
      }
      if (selectedPlantPart && selectedPlantPart !== 'auto') {
        formData.append('plant_part', selectedPlantPart);
      }
      if (notes) {
        formData.append('notes', notes);
      }

      const requestHeaders = { 'Content-Type': 'multipart/form-data' };
      const currentKey = localStorage.getItem('plantcure_gemini_api_key');
      if (currentKey && currentKey.trim()) {
        requestHeaders['X-Gemini-API-Key'] = currentKey.trim();
      }

      const response = await api.post('/api/predict/', formData, {
        headers: requestHeaders,
      });

      toast.success('Diagnosis completed!');

      // Pass result and preview image to result page via router state
      navigate('/results', {
        state: {
          result: response.data,
          previewUrl: previewUrl,
        },
      });
    } catch (error) {
      console.error('Prediction API error:', error);
      const data = error.response?.data;
      const isLandscape = data?.error_code === 'DISTANT_LANDSCAPE_DETECTED';
      const isInvalidPlant = isLandscape ||
                             data?.error_code === 'NO_PLANT_LEAF_DETECTED' || 
                             data?.error_code === 'NO_PLANT_PART_DETECTED' ||
                             data?.is_valid_plant === false ||
                             data?.is_valid_plant_image === false;

      if (isInvalidPlant) {
        setInvalidImageError({
          title: isLandscape 
            ? "Distant Landscape / Road Scene Detected" 
            : "This doesn't look like a plant part.",
          tamilTitle: isLandscape
            ? "தூரத்து இயற்கை காட்சி / சாலை கண்டறியப்பட்டது"
            : 'செல்லுபடியாகாத படம்: தாவர பாகம் (இலை, தண்டு, வேர், பூ, பழம், விதை) கண்டறியப்படவில்லை',
          detail: data?.detail || (isLandscape 
            ? 'Please upload a close-up (macro) photo of a single plant part (leaf, stem, root, flower, fruit, or seed) rather than a distant landscape.' 
            : 'Please upload a photo of a plant leaf, stem, root, flower, fruit, or seed.'),
          tamilDetail: data?.tamil_detail || (isLandscape
            ? 'முழு இயற்கை காட்சி அல்லது சாலைக்கு பதிலாக, ஒரு குறிப்பிட்ட தாவர பாகத்தை அருகில் (Close-up) புகைப்படம் எடுத்து பதிவேற்றவும்.'
            : 'தயவுசெய்து தாவர இலை, தண்டு, வேர், பூ, பழம் அல்லது விதையின் தெளிவான புகைப்படத்தை பதிவேற்றவும்.'),
          reason: data?.reason || (isLandscape
            ? 'Distant panoramic view or roadway detected. Plant diagnosis requires close-up macro plant imagery (leaf, stem, root, flower, fruit, or seed).'
            : 'The uploaded photo does not contain identifiable plant botanical structure (Stage 1 validation failed under 65% threshold).')
        });
        toast.error(data?.detail || "Please upload a close-up photo of a plant part (leaf, stem, root, flower, fruit, or seed).");
      } else {
        const detail = data?.detail || 'Failed to analyze plant image. Please try again.';
        toast.error(detail);
      }
      setIsPredicting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Automatic Plant & Disease Recognition</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Upload Any Plant Photo
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Simply upload a clear photo of any leaf, flower, fruit, stem, or root. Our AI will automatically identify the plant species, its botanical scientific name, and diagnose whether it is healthy or infected.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
        
        {/* Invalid Non-Plant Image Alert Banner */}
        {invalidImageError && (
          <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-red-800 dark:text-red-200">
                    {invalidImageError.title}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-200/70 dark:bg-red-900/80 text-red-800 dark:text-red-200">
                    AI Quality Filter
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">
                  {invalidImageError.tamilTitle}
                </p>
                <p className="text-xs text-red-600 dark:text-red-300/90 pt-1">
                  {invalidImageError.detail}
                </p>
                <p className="text-xs text-red-500 dark:text-red-400">
                  {invalidImageError.tamilDetail}
                </p>
                {invalidImageError.reason && (
                  <div className="mt-2 p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-red-200 dark:border-red-900/60 text-[11px] font-mono text-red-700 dark:text-red-300">
                    <span className="font-bold">System Inspection:</span> {invalidImageError.reason}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-red-200 dark:border-red-900/50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-red-700 dark:text-red-300 font-medium">
                ⚠️ PlantCure AI requires a focused, close-up (macro) photo of an individual plant part (leaf, stem, root, flower, fruit, or seed). Distant landscapes, roads, vehicles, people, pets, or documents cannot be diagnosed.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Clear Photo
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Choose Another Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dropzone or Preview */}
        {!previewUrl ? (
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 scale-[1.01]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-slate-50/70 dark:hover:bg-slate-850'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                onChange={(e) => handleFileChange(e.target.files?.[0])}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                  Drag and drop your real plant photo here
                </p>
                <p className="text-xs sm:text-sm text-slate-500">
                  Upload a photo of any leaf, stem, root, flower, fruit, or seed from your device
                </p>
              </div>

              {/* Action buttons inside upload zone */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Choose from Files</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white dark:bg-slate-700 hover:bg-slate-900 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Photo with Camera</span>
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                <span>Supports JPG, PNG, WEBP from any device</span>
                <span>•</span>
                <span>Max size: 15MB</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Image Preview Box */}
              <div className="md:col-span-6 relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-md">
                <img
                  src={previewUrl}
                  alt="Selected Plant Preview"
                  className="w-full h-full object-cover"
                />
                
                {isPredicting && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
                    <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-glow-green"></div>
                    <div className="space-y-2 max-w-xs">
                      <p className="font-bold text-white text-base">Two-Stage AI Inference...</p>
                      <div className="text-xs text-emerald-300 font-mono space-y-1">
                        {predictionStep === 1 && (
                          <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-800/80">
                            <span className="font-bold text-amber-300 block">Stage 1: Plant Part Validation</span>
                            Verifying botanical plant tissue (&gt;70% threshold)...
                          </div>
                        )}
                        {predictionStep === 2 && (
                          <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-800/80">
                            <span className="font-bold text-emerald-300 block">Stage 1: Verified Plant Part ✓</span>
                            Extracting chlorophyll & vascular tissue morphology...
                          </div>
                        )}
                        {predictionStep === 3 && (
                          <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-800/80">
                            <span className="font-bold text-cyan-300 block">Stage 2: Disease Detection</span>
                            MobileNetV2 identifying foliar/stem/root pathologies...
                          </div>
                        )}
                        {predictionStep >= 4 && (
                          <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-800/80">
                            <span className="font-bold text-teal-300 block">Finalizing Diagnosis</span>
                            Formulating tailored organic & chemical treatments...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Information & Action Details */}
              <div className="md:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                    <FileCheck className="w-4 h-4" />
                    <span>Plant Image Ready</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isPredicting}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Change Photo</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Name:</span>
                    <span className="font-medium truncate max-w-[200px]">{selectedFile?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Size:</span>
                    <span className="font-medium">{selectedFile ? (selectedFile.size / 1024).toFixed(1) + ' KB' : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Analysis Mode:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      100% Automatic Detection
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auto-Save History:</span>
                    <span className="font-medium">{isAuthenticated ? 'Yes (to your account)' : 'No (sign in to save)'}</span>
                  </div>
                </div>

                {/* 100% Autonomous Recognition Guidance Banner */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-300 shadow-sm">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold block text-slate-900 dark:text-white text-xs">
                      100% Automatic Species & Health Diagnosis
                    </span>
                    <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                      You do not need to know the plant name or select its organ. Our AI inspects your image internally to automatically reveal the <strong>Real Name</strong>, <strong>Botanical Scientific Name</strong>, and whether it is <strong>Healthy or Diseased</strong>.
                    </p>
                  </div>
                </div>

                {/* Optional Farm Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Field Notes (Optional):
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Field #3, noticed yellowing or spots"
                    disabled={isPredicting}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPredicting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all disabled:opacity-60 text-sm sm:text-base cursor-pointer"
                >
                  {isPredicting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing Plant & Diagnosing Health...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Photo & Diagnose Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


