import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  History,
  Trash2,
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';

export const ScanHistoryPage = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCrop, setFilterCrop] = useState('all');
  const [filterPlantPart, setFilterPlantPart] = useState('all');
  const [selectedScan, setSelectedScan] = useState(null);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const resp = await api.get('/api/history/');
      setScans(resp.data.results || []);
    } catch (err) {
      toast.error('Failed to load scan history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this scan record?')) return;

    try {
      await api.delete(`/api/history/${id}/`);
      setScans((prev) => prev.filter((item) => item.id !== id));
      toast.success('Scan record deleted.');
      if (selectedScan?.id === id) setSelectedScan(null);
    } catch (err) {
      toast.error('Could not delete scan record.');
    }
  };

  const filteredScans = scans.filter((scan) => {
    const part = (scan.detected_plant_part || 'leaf').toLowerCase();
    const isValid = scan.is_valid_plant_image !== false;

    const matchesSearch =
      scan.predicted_disease_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scan.crop && scan.crop.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (scan.detected_plant_part && scan.detected_plant_part.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (scan.notes && scan.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCrop = filterCrop === 'all' || (scan.crop && scan.crop.toLowerCase() === filterCrop.toLowerCase());

    const matchesPart =
      filterPlantPart === 'all' ||
      (filterPlantPart === 'invalid' && !isValid) ||
      (filterPlantPart === 'leaf' && isValid && part === 'leaf') ||
      (filterPlantPart === 'flower' && isValid && part === 'flower') ||
      (filterPlantPart === 'fruit' && isValid && part === 'fruit') ||
      (filterPlantPart === 'stem' && isValid && part === 'stem') ||
      (filterPlantPart === 'root' && isValid && part === 'root') ||
      (filterPlantPart === 'seed' && isValid && part === 'seed');

    return matchesSearch && matchesCrop && matchesPart;
  });

  const crops = ['all', ...Array.from(new Set(scans.map((s) => s.crop).filter(Boolean)))];

  const plantPartTabs = [
    { id: 'all', label: 'All Parts' },
    { id: 'leaf', label: '🌿 Leaves' },
    { id: 'flower', label: '🌸 Flowers' },
    { id: 'fruit', label: '🍎 Fruits' },
    { id: 'stem', label: '🎋 Stems' },
    { id: 'root', label: '🥕 Roots' },
    { id: 'seed', label: '🌰 Seeds' },
    { id: 'invalid', label: '⚠️ Invalid' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>SQLite Database Records</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Diagnostic Plant Scan History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and review past foliar, stem, and root disease examinations and treatment plans.
          </p>
        </div>

        <Link
          to="/scan"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all self-start sm:self-auto"
        >
          <ScanLine className="w-4 h-4" />
          <span>New Plant Scan</span>
        </Link>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Total Scans</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{scans.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Healthy Plants</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {scans.filter(s => s.is_healthy).length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Issues Flagged</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">
              {scans.filter(s => !s.is_healthy && s.is_valid_plant_image !== false).length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Organs Monitored</span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">
              {Array.from(new Set(scans.map(s => s.detected_plant_part).filter(Boolean))).length || 6}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by disease, part, crop, or notes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Plant Part Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {plantPartTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterPlantPart(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  filterPlantPart === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Crop Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1">
          <span className="text-xs font-bold text-slate-400 mr-1 shrink-0">Crops:</span>
          {crops.map((crop) => (
            <button
              key={crop}
              onClick={() => setFilterCrop(crop)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize whitespace-nowrap transition-colors ${
                filterCrop === crop
                  ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {crop === 'all' ? 'All Species' : crop}
            </button>
          ))}
        </div>
      </div>

      {/* Scans Grid / Empty States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4 bg-white/50 dark:bg-slate-900/50">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <ScanLine className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg">
              {searchQuery ? 'No matching scans found' : 'No plant scans recorded yet'}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search keyword or clear crop/part filters.'
                : 'Upload your first plant part (leaf, stem, or root) to get an instant diagnosis and build your agricultural scan journal.'}
            </p>
          </div>
          {!searchQuery && (
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
            >
              Scan a Plant Now
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScans.map((scan) => (
            <div
              key={scan.id}
              onClick={() => setSelectedScan(scan)}
              className="group cursor-pointer rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-200 flex flex-col"
            >
              {/* Image thumbnail */}
              <div className="aspect-[16/10] overflow-hidden bg-slate-950 relative">
                <img
                  src={scan.image_url || scan.image}
                  alt={scan.predicted_disease_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/60 backdrop-blur-md text-white">
                    {scan.crop || 'Plant'}
                  </span>
                  {scan.is_valid_plant_image === false ? (
                    <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-red-600/90 text-white backdrop-blur-md">
                      ⚠️ Invalid
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-emerald-700/90 text-white backdrop-blur-md capitalize">
                      {scan.detected_plant_part === 'root' ? '🥕 Root' : 
                       scan.detected_plant_part === 'stem' ? '🎋 Stem' : 
                       scan.detected_plant_part === 'flower' ? '🌸 Flower' : 
                       scan.detected_plant_part === 'fruit' ? '🍎 Fruit' : 
                       scan.detected_plant_part === 'seed' ? '🌰 Seed' : '🌿 Leaf'}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600/90 text-white backdrop-blur-md">
                  {scan.confidence}% Confidence
                </div>
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {scan.predicted_disease_name}
                    </h3>
                  </div>

                  {scan.scientific_name && (
                    <p className="text-xs font-serif italic text-emerald-600 dark:text-emerald-400 line-clamp-1">
                      {scan.scientific_name}
                    </p>
                  )}

                  {scan.notes && (
                    <p className="text-xs text-slate-500 italic line-clamp-2">
                      "{scan.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(scan.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(scan.id, e)}
                      aria-label="Delete scan"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                      <span>View</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Modal on Card Click */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Scan Record #{selectedScan.id}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {selectedScan.predicted_disease_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              <div className="sm:col-span-6 rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950 border border-slate-200 dark:border-slate-800 shadow">
                <img
                  src={selectedScan.image_url || selectedScan.image}
                  alt={selectedScan.predicted_disease_name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="sm:col-span-6 space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Crop / Plant:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedScan.crop}</span>
                </div>
                {selectedScan.scientific_name && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Scientific Name:</span>
                    <span className="font-serif italic font-semibold text-emerald-600 dark:text-emerald-400">
                      {selectedScan.scientific_name}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Plant Organ:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {selectedScan.detected_plant_part === 'root' ? '🥕 Root' : 
                     selectedScan.detected_plant_part === 'stem' ? '🎋 Stem' : 
                     selectedScan.detected_plant_part === 'flower' ? '🌸 Flower' : 
                     selectedScan.detected_plant_part === 'fruit' ? '🍎 Fruit' : 
                     selectedScan.detected_plant_part === 'seed' ? '🌰 Seed' : '🌿 Leaf'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Stage 1 Valid:</span>
                  <span className={`font-bold ${selectedScan.is_valid_plant_image === false ? 'text-red-500' : 'text-emerald-600'}`}>
                    {selectedScan.is_valid_plant_image === false ? 'No (Rejected non-plant)' : 'Yes (Botanical Plant Part)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Confidence:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedScan.confidence}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Scanned Date:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {new Date(selectedScan.timestamp).toLocaleString()}
                  </span>
                </div>
                {selectedScan.notes && (
                  <div className="py-1">
                    <span className="text-slate-500 block mb-1">Notes:</span>
                    <p className="italic text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                      {selectedScan.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedScan.disease_details && (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs sm:text-sm">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                    Organic Treatment Remedy:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedScan.disease_details.organic_treatment}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs sm:text-sm">
                  <span className="font-bold text-blue-800 dark:text-blue-300 block mb-1">
                    Prevention & Maintenance:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedScan.disease_details.prevention_tips}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={(e) => handleDelete(selectedScan.id, e)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Record</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedScan(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
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
