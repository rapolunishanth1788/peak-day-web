import React, { useState } from 'react';
import {
  Search,
  Dumbbell,
  Award,
  BookOpen,
  X,
  Play,
  CheckCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { useFitness } from '../../contexts/FitnessContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EXERCISE_LIBRARY, MUSCLE_COLOR_MAP } from '../../data/exerciseLibrary';
import { Exercise, MuscleGroup } from '../../types/fitness';

export const ExerciseLibraryView: React.FC = () => {
  const { personalRecords, startWorkout } = useFitness();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All');
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);

  const muscleGroups = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core', 'Cardio'];
  const equipmentTypes = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Cardio Machine'];

  const filteredExercises = EXERCISE_LIBRARY.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(search.toLowerCase()) ||
      ex.instructions.some((inst) => inst.toLowerCase().includes(search.toLowerCase()));

    const matchesMuscle = selectedMuscle === 'All' || ex.primaryMuscle === selectedMuscle;
    const matchesEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment;

    return matchesSearch && matchesMuscle && matchesEquipment;
  });

  // Lookup PR for active exercise
  const getExercisePR = (exerciseId: string) => {
    return personalRecords.find((p) => p.exerciseId === exerciseId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Exercise Vault & Biomechanics Library
        </h2>
        <p className="text-sm text-slate-400">
          Curated movements with form execution guides, muscle recruitment cues & historical PRs.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <GlassCard className="p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search exercises by name, technique or muscle group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/80 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Muscle group chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {muscleGroups.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedMuscle === m
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.05]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Equipment filter */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs text-slate-400 pt-1">
          <span className="font-semibold text-slate-300">Equipment:</span>
          {equipmentTypes.map((eq) => (
            <button
              key={eq}
              onClick={() => setSelectedEquipment(eq)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                selectedEquipment === eq
                  ? 'bg-white/[0.12] text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {eq}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Grid of Exercises */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((ex) => {
          const pr = getExercisePR(ex.id);
          const accentColor = MUSCLE_COLOR_MAP[ex.primaryMuscle] || '#3b82f6';

          return (
            <GlassCard
              key={ex.id}
              onClick={() => setActiveExerciseModal(ex)}
              className="p-5 flex flex-col justify-between space-y-3 cursor-pointer hover:border-white/[0.15] transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${accentColor}25`,
                      color: accentColor,
                      border: `1px solid ${accentColor}40`,
                    }}
                  >
                    {ex.primaryMuscle}
                  </span>
                  <Badge variant="outline" size="sm">{ex.equipment}</Badge>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {ex.name}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {ex.instructions[0]}
                </p>
              </div>

              {/* Bottom PR & rest details */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                {pr ? (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    PR: {pr.maxWeight} lbs × {pr.repsAtMaxWeight}
                  </span>
                ) : (
                  <span className="text-slate-500">Rest: {ex.defaultRestSeconds}s</span>
                )}
                <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform font-medium">
                  Form Guide →
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Detailed Exercise Modal */}
      {activeExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-900 border border-white/[0.12] rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="blue" size="sm">{activeExerciseModal.primaryMuscle}</Badge>
                  <Badge variant="outline" size="sm">{activeExerciseModal.equipment}</Badge>
                  <Badge variant="emerald" size="sm">{activeExerciseModal.category}</Badge>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {activeExerciseModal.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveExerciseModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PR Status Card if available */}
            {getExercisePR(activeExerciseModal.id) && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-xs text-amber-300 font-bold">Personal Record Vault</p>
                    <p className="text-sm font-black text-white">
                      {getExercisePR(activeExerciseModal.id)!.maxWeight} lbs ×{' '}
                      {getExercisePR(activeExerciseModal.id)!.repsAtMaxWeight} reps
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">Estimated 1RM</p>
                  <p className="text-base font-black text-amber-400">
                    {getExercisePR(activeExerciseModal.id)!.estimated1RM} lbs
                  </p>
                </div>
              </div>
            )}

            {/* Execution Instructions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                Step-by-Step Biomechanical Execution
              </h4>
              <ol className="space-y-2 text-xs text-slate-300">
                {activeExerciseModal.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-2.5 p-2 rounded-lg bg-white/[0.02]">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Coaching Tips */}
            {activeExerciseModal.tips && activeExerciseModal.tips.length > 0 && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1 text-xs">
                <p className="font-bold text-blue-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Form & Safety Cue
                </p>
                <p className="text-slate-200">{activeExerciseModal.tips[0]}</p>
              </div>
            )}

            {/* Start Live Workout Action */}
            <div className="pt-2 flex gap-3">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => setActiveExerciseModal(null)}
              >
                Close
              </Button>
              <Button
                variant="accent-emerald"
                size="md"
                className="flex-1 justify-center"
                onClick={() => {
                  startWorkout(null, `${activeExerciseModal.name} Session`);
                  setActiveExerciseModal(null);
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Workout Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
