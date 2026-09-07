import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Info,
  Layers,
  HeartHandshake
} from 'lucide-react';

export const DiseaseEncyclopediaPage = () => {
  const [diseases, setDiseases] = useState([]);
  const [crops, setCrops] = useState([]);
  const [plantParts, setPlantParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedPlantPart, setSelectedPlantPart] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalDisease, setActiveModalDisease] = useState(null);

  const toast = useToast();

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      const resp = await api.get('/api/diseases/');
      setDiseases(resp.data.results || []);
      setCrops(resp.data.crops || []);
      setPlantParts(resp.data.plant_parts || ['leaf', 'stem', 'root', 'fruit', 'whole_plant']);
    } catch (err) {
      toast.error('Failed to load disease encyclopedia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiseases();
  }, []);

  const filteredDiseases = diseases.filter((d) => {
    const matchesCrop = selectedCrop === 'all' || d.crop.toLowerCase() === selectedCrop.toLowerCase();
    const matchesPart = selectedPlantPart === 'all' || ((d.plant_part || 'leaf').toLowerCase() === selectedPlantPart.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || d.severity_level.toLowerCase() === selectedSeverity.toLowerCase();
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.scientific_name && d.scientific_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.plant_part && d.plant_part.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.symptoms.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCrop && matchesPart && matchesSeverity && matchesSearch;
  });

  const getPlantPartBadge = (part) => {
    switch (part?.toLowerCase()) {
      case 'flower':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300">
            🌸 Flower
          </span>
        );
      case 'fruit':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            🍎 Fruit
          </span>
        );
      case 'seed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            🌰 Seed
          </span>
        );
      case 'stem':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
            🎋 Stem
          </span>
        );
      case 'root':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
            🥕 Root
          </span>
        );
      case 'leaf':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            🌿 Leaf
          </span>
        );
    }
  };

  const getSeverityBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'healthy':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Healthy
          </span>
        );
      case 'mild':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Mild
          </span>
        );
      case 'moderate':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Moderate
          </span>
        );
      case 'severe':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
            Severe
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
          <span>Botanical Knowledge Base</span>
        </div>
        {/* Header Description */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Plant Disease Encyclopedia
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Explore comprehensive botanical guides for leaf, stem, root, flower, fruit, and seed pathogens, organic bio-treatments, and preventive farm practices.
        </p>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by pathogen, crop, or symptoms (e.g. Early Blight, Botrytis, Rust, Storage Mold)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Plant Part Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-400 mr-1 shrink-0">Plant Organ:</span>
          {[
            { id: 'all', label: 'All Organs' },
            { id: 'leaf', label: '🌿 Leaves' },
            { id: 'flower', label: '🌸 Flowers' },
            { id: 'fruit', label: '🍎 Fruits' },
            { id: 'stem', label: '🎋 Stems' },
            { id: 'root', label: '🥕 Roots' },
            { id: 'seed', label: '🌰 Seeds / Grains' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedPlantPart(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedPlantPart === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Crop Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 mr-1 shrink-0">Crops:</span>
          <button
            onClick={() => setSelectedCrop('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCrop === 'all'
                ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Crops ({diseases.length})
          </button>
          {crops.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCrop === crop
                  ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>

      </div>

      {/* Diseases Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredDiseases.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <p className="font-bold text-slate-700 dark:text-slate-200 text-base">No diseases found matching your search.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCrop('all');
              setSelectedPlantPart('all');
              setSelectedSeverity('all');
            }}
            className="text-xs font-semibold text-emerald-600 hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDiseases.map((disease) => (
            <div
              key={disease.id}
              onClick={() => setActiveModalDisease(disease)}
              className="group cursor-pointer rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Visual Image Header */}
                <div className="aspect-[16/9] overflow-hidden bg-slate-950 relative">
                  <img
                    src={disease.image_sample || 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80'}
                    alt={disease.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-black/70 backdrop-blur-md text-white">
                      {disease.crop}
                    </span>
                    {getPlantPartBadge(disease.plant_part)}
                  </div>
                  <div className="absolute bottom-3 right-3">
                    {getSeverityBadge(disease.severity_level)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {disease.name}
                    </h3>
                    {disease.scientific_name && (
                      <p className="text-xs text-slate-400 italic">
                        {disease.scientific_name}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {disease.description}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>View Treatments & Symptoms</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disease Detail Modal */}
      {activeModalDisease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {activeModalDisease.crop}
                  </span>
                  {getPlantPartBadge(activeModalDisease.plant_part)}
                  {getSeverityBadge(activeModalDisease.severity_level)}
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {activeModalDisease.name}
                </h2>
                {activeModalDisease.scientific_name && (
                  <p className="text-xs sm:text-sm text-slate-400 italic">
                    {activeModalDisease.scientific_name}
                  </p>
                )}
              </div>
              <button
                onClick={() => setActiveModalDisease(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overview</span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeModalDisease.description}
              </p>
            </div>

            {/* Symptoms */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-1">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Visible Symptoms & Pathological Signs
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeModalDisease.symptoms}
              </p>
            </div>

            {/* Treatments: Organic + Chemical */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  Organic Remedies
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeModalDisease.organic_treatment}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Chemical Controls
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeModalDisease.chemical_treatment}
                </p>
              </div>
            </div>

            {/* Prevention */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-1">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Cultural & Preventive Farm Management
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeModalDisease.prevention_tips}
              </p>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-between items-center pt-2">
              <Link
                to="/scan"
                onClick={() => setActiveModalDisease(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow"
              >
                <span>Upload Plant Image to Scan</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setActiveModalDisease(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
