import React, { useState } from 'react';
import {
  TrendingUp,
  Scale,
  Camera,
  Plus,
  Calendar,
  X,
  Sparkles,
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useFitness } from '../../contexts/FitnessContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { BodyMetricsEntry } from '../../types/fitness';

export const BodyTrackingView: React.FC = () => {
  const { bodyMetrics, logBodyMetrics } = useFitness();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState<number>(175);
  const [bodyFat, setBodyFat] = useState<number>(14.5);
  const [notes, setNotes] = useState('');
  const [chest, setChest] = useState<number>(41);
  const [waist, setWaist] = useState<number>(31.5);
  const [hips, setHips] = useState<number>(37);
  const [biceps, setBiceps] = useState<number>(15.5);
  const [thighs, setThighs] = useState<number>(23.5);
  const [calves, setCalves] = useState<number>(15);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  // Latest entry
  const sortedMetrics = [...bodyMetrics].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const latestMetric = sortedMetrics.length > 0 ? sortedMetrics[sortedMetrics.length - 1] : null;
  const previousMetric = sortedMetrics.length > 1 ? sortedMetrics[sortedMetrics.length - 2] : null;

  // Chart data for weight and body fat over time
  const chartData = sortedMetrics.map((m) => ({
    date: m.date.slice(5),
    weight: m.weightLbs,
    bodyFat: m.bodyFatPercentage || null,
  }));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logBodyMetrics({
      date,
      weightLbs: weight,
      bodyFatPercentage: bodyFat || undefined,
      notes,
      measurements: {
        chestInches: chest || undefined,
        waistInches: waist || undefined,
        hipsInches: hips || undefined,
        bicepsInches: biceps || undefined,
        thighsInches: thighs || undefined,
        calvesInches: calves || undefined,
      },
      photos: photoUrl
        ? [{ id: `photo-${Date.now()}`, url: photoUrl, date, angle: 'front', note: 'Check-in Photo' }]
        : undefined,
    });

    setIsModalOpen(false);
    setPhotoUrl('');
    setNotes('');
  };

  // Compute weight delta
  const weightDelta = latestMetric && previousMetric
    ? (latestMetric.weightLbs - previousMetric.weightLbs).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Body Composition & Metric Tracking
          </h2>
          <p className="text-sm text-slate-400">
            Log scale weight, body fat %, circumference measurements, and physique transformation photos.
          </p>
        </div>

        <Button
          variant="accent-emerald"
          size="md"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Log Metric Check-In
        </Button>
      </div>

      {/* Top Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Current Scale Weight
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white">
              {latestMetric ? latestMetric.weightLbs : '--'}
            </span>
            <span className="text-sm font-semibold text-slate-400">lbs</span>
            {weightDelta && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded flex items-center ${
                  parseFloat(weightDelta) < 0
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-amber-400 bg-amber-500/10'
                }`}
              >
                {parseFloat(weightDelta) < 0 ? (
                  <ArrowDown className="w-3 h-3 mr-0.5" />
                ) : (
                  <ArrowUp className="w-3 h-3 mr-0.5" />
                )}
                {Math.abs(parseFloat(weightDelta))} lbs
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Last logged: {latestMetric ? latestMetric.date : 'None'}
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Estimated Body Fat
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-400">
              {latestMetric?.bodyFatPercentage ? `${latestMetric.bodyFatPercentage}%` : '--%'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Caliper / DEXA</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Lean mass retention optimal</p>
        </GlassCard>

        <GlassCard className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Key Circumference
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-blue-400">
              {latestMetric?.measurements?.waistInches ? `${latestMetric.measurements.waistInches}"` : '--"'}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Waistline</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chest: {latestMetric?.measurements?.chestInches ? `${latestMetric.measurements.chestInches}"` : '--"'} • Arms:{' '}
            {latestMetric?.measurements?.bicepsInches ? `${latestMetric.measurements.bicepsInches}"` : '--"'}
          </p>
        </GlassCard>
      </div>

      {/* Chart: Scale Weight Trend */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Weight Progression Timeline</h3>
            <p className="text-xs text-slate-400">Trendline of logged check-ins (lbs)</p>
          </div>
          <Badge variant="blue" size="sm">
            {chartData.length} Check-ins Recorded
          </Badge>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 3', 'dataMax + 3']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                name="Weight (lbs)"
                stroke="#38bdf8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#weightGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Circumference Measurements Table & Progress Photos Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Circumference Table */}
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Circumference Measurements
          </h3>

          <div className="space-y-2">
            {[
              { label: 'Chest', val: latestMetric?.measurements?.chestInches },
              { label: 'Arms / Biceps', val: latestMetric?.measurements?.bicepsInches },
              { label: 'Waist', val: latestMetric?.measurements?.waistInches },
              { label: 'Hips', val: latestMetric?.measurements?.hipsInches },
              { label: 'Thighs', val: latestMetric?.measurements?.thighsInches },
              { label: 'Calves', val: latestMetric?.measurements?.calvesInches },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-sm"
              >
                <span className="text-slate-300 font-medium">{item.label}</span>
                <span className="text-white font-bold">
                  {item.val ? `${item.val} inches` : 'Not recorded'}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Progress Photos Gallery */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Progress Photo Gallery
              </h3>
              <p className="text-xs text-slate-400">Visual physique transformation log</p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <span className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/[0.08] inline-flex items-center gap-1.5 transition-colors">
                <Camera className="w-3.5 h-3.5" />
                Upload Photo
              </span>
            </label>
          </div>

          {/* Photos list */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {bodyMetrics.flatMap((m) => m.photos || []).length > 0 ? (
              bodyMetrics
                .flatMap((m) => m.photos || [])
                .map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-[3/4] rounded-xl overflow-hidden border border-white/[0.1] relative group"
                  >
                    <img
                      src={photo.url}
                      alt={photo.note || 'Progress photo'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-[10px] text-white">
                      <span className="font-bold">{photo.date}</span>
                      <span className="text-slate-300">{photo.angle}</span>
                    </div>
                  </div>
                ))
            ) : (
              <div className="col-span-full py-10 text-center space-y-2 border border-dashed border-white/[0.08] rounded-xl">
                <ImageIcon className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400">
                  No progress photos uploaded yet. Snap regular photos to compare your symmetry and body composition over time!
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Check-In Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-white/[0.12] rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Log Body Metric Check-In</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Scale Weight (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white text-center font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Body Fat % (Opt)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white text-center"
                  />
                </div>
              </div>

              {/* Circumference Measurements */}
              <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Circumference Tape Measurements (Inches)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400">Chest</span>
                    <input
                      type="number"
                      step="0.25"
                      value={chest}
                      onChange={(e) => setChest(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-white/[0.1] rounded-lg p-1.5 text-xs text-white text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Waist</span>
                    <input
                      type="number"
                      step="0.25"
                      value={waist}
                      onChange={(e) => setWaist(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-white/[0.1] rounded-lg p-1.5 text-xs text-white text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Hips</span>
                    <input
                      type="number"
                      step="0.25"
                      value={hips}
                      onChange={(e) => setHips(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-white/[0.1] rounded-lg p-1.5 text-xs text-white text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Arms / Biceps</span>
                    <input
                      type="number"
                      step="0.25"
                      value={biceps}
                      onChange={(e) => setBiceps(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-white/[0.1] rounded-lg p-1.5 text-xs text-white text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Thighs</span>
                    <input
                      type="number"
                      step="0.25"
                      value={thighs}
                      onChange={(e) => setThighs(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-white/[0.1] rounded-lg p-1.5 text-xs text-white text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Calves</span>
                    <input
                      type="number"
                      step="0.25"
                      value={calves}
                      onChange={(e) => setCalves(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-white/[0.1] rounded-lg p-1.5 text-xs text-white text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Progress Photo attach */}
              <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
                <label className="text-xs font-semibold text-slate-300">Progress Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
                {photoUrl && (
                  <div className="w-20 h-24 rounded-lg overflow-hidden border border-emerald-500/50 mt-2">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Notes / Nutrition Context</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Weighing in fasted. Morning water intake consistent."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-white/[0.1] rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  className="flex-1"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="accent-emerald"
                  size="md"
                  className="flex-1"
                  type="submit"
                >
                  Save Check-In
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
