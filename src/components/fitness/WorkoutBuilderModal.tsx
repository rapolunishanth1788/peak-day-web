import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  Dumbbell,
  Timer,
  ChevronDown,
  ChevronUp,
  Play,
  Save,
  Search,
} from 'lucide-react';
import { useFitness } from '../../contexts/FitnessContext';
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary';
import { WorkoutExercise, WorkoutSet, MuscleGroup, EquipmentType } from '../../types/fitness';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface WorkoutBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: {
    id?: string;
    name: string;
    category: string;
    description?: string;
    exercises: WorkoutExercise[];
    estimatedDurationMinutes?: number;
  } | null;
}

export const WorkoutBuilderModal: React.FC<WorkoutBuilderModalProps> = ({
  isOpen,
  onClose,
  initialTemplate,
}) => {
  const { saveTemplate, startWorkout } = useFitness();

  const [routineName, setRoutineName] = useState(initialTemplate?.name || '');
  const [category, setCategory] = useState(initialTemplate?.category || 'Push / Pull / Legs');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [exercises, setExercises] = useState<WorkoutExercise[]>(
    initialTemplate?.exercises || [
      {
        id: `we-${Date.now()}-1`,
        exerciseId: EXERCISE_LIBRARY[0].id,
        exerciseName: EXERCISE_LIBRARY[0].name,
        primaryMuscle: EXERCISE_LIBRARY[0].primaryMuscle,
        equipment: EXERCISE_LIBRARY[0].equipment,
        targetSets: 3,
        restTimeSeconds: 90,
        notes: '',
        sets: [
          { id: 's1', setNumber: 1, targetReps: 10, targetWeight: 135, completed: false },
          { id: 's2', setNumber: 2, targetReps: 8, targetWeight: 155, completed: false },
          { id: 's3', setNumber: 3, targetReps: 6, targetWeight: 175, completed: false },
        ],
      },
    ]
  );

  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [expandedIndex, setExpandedIndex] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  // Add an exercise to the routine
  const handleAddExerciseFromLibrary = (exerciseId: string) => {
    const ex = EXERCISE_LIBRARY.find((e) => e.id === exerciseId);
    if (!ex) return;

    const newEx: WorkoutExercise = {
      id: `we-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      exerciseId: ex.id,
      exerciseName: ex.name,
      primaryMuscle: ex.primaryMuscle,
      equipment: ex.equipment,
      targetSets: 3,
      restTimeSeconds: ex.defaultRestSeconds || 90,
      notes: '',
      sets: [
        { id: `s-${Date.now()}-1`, setNumber: 1, targetReps: 10, targetWeight: 100, completed: false },
        { id: `s-${Date.now()}-2`, setNumber: 2, targetReps: 10, targetWeight: 100, completed: false },
        { id: `s-${Date.now()}-3`, setNumber: 3, targetReps: 8, targetWeight: 110, completed: false },
      ],
    };

    setExercises((prev) => [...prev, newEx]);
    setExpandedIndex(exercises.length);
    setIsExercisePickerOpen(false);
  };

  const handleRemoveExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  // Add set to an exercise
  const handleAddSet = (exIdx: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const target = { ...updated[exIdx] };
      const sets = [...target.sets];
      const last = sets[sets.length - 1];

      const newSet: WorkoutSet = {
        id: `s-${Date.now()}-${sets.length + 1}`,
        setNumber: sets.length + 1,
        targetReps: last ? last.targetReps : 10,
        targetWeight: last ? last.targetWeight : 100,
        completed: false,
      };

      target.sets = [...sets, newSet];
      target.targetSets = target.sets.length;
      updated[exIdx] = target;
      return updated;
    });
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) => {
      const updated = [...prev];
      const target = { ...updated[exIdx] };
      if (target.sets.length <= 1) return prev;

      const filtered = target.sets.filter((_, i) => i !== setIdx);
      target.sets = filtered.map((s, i) => ({ ...s, setNumber: i + 1 }));
      target.targetSets = target.sets.length;
      updated[exIdx] = target;
      return updated;
    });
  };

  const handleUpdateSet = (exIdx: number, setIdx: number, updates: Partial<WorkoutSet>) => {
    setExercises((prev) => {
      const updated = [...prev];
      const target = { ...updated[exIdx] };
      const sets = [...target.sets];
      sets[setIdx] = { ...sets[setIdx], ...updates };
      target.sets = sets;
      updated[exIdx] = target;
      return updated;
    });
  };

  const handleUpdateExerciseNotesOrRest = (exIdx: number, field: 'notes' | 'restTimeSeconds', value: string | number) => {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exIdx] = { ...updated[exIdx], [field]: value };
      return updated;
    });
  };

  // Target muscle groups computed from selected exercises
  const targetMuscleGroups: MuscleGroup[] = Array.from(
    new Set(exercises.map((e) => e.primaryMuscle))
  );

  const estimatedDuration = Math.max(30, exercises.reduce((acc, ex) => acc + ex.sets.length * 2.5, 10));

  const handleSaveOnly = async () => {
    if (!routineName.trim()) {
      alert('Please enter a routine name.');
      return;
    }
    setSaving(true);
    await saveTemplate({
      id: initialTemplate?.id,
      name: routineName,
      category,
      description,
      exercises,
      targetMuscleGroups,
      estimatedDurationMinutes: Math.round(estimatedDuration),
    });
    setSaving(false);
    onClose();
  };

  const handleSaveAndStart = async () => {
    if (!routineName.trim()) {
      alert('Please enter a routine name.');
      return;
    }
    setSaving(true);
    const templateId = await saveTemplate({
      id: initialTemplate?.id,
      name: routineName,
      category,
      description,
      exercises,
      targetMuscleGroups,
      estimatedDurationMinutes: Math.round(estimatedDuration),
    });
    setSaving(false);
    startWorkout({
      id: templateId,
      name: routineName,
      category,
      description,
      exercises,
      targetMuscleGroups,
      estimatedDurationMinutes: Math.round(estimatedDuration),
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  const filteredLibrary = EXERCISE_LIBRARY.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesMuscle = muscleFilter === 'All' || ex.primaryMuscle === muscleFilter;
    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-slate-900 border border-white/[0.12] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialTemplate ? 'Edit Workout Routine' : 'Workout Builder'}
              </h2>
              <p className="text-xs text-slate-400">
                Design custom splits, set progressions, target reps & rest intervals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Workout Basics: Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Workout Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Upper Body Hypertrophy"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="w-full bg-slate-800/80 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Training Split / Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800/80 border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Push / Pull / Legs">Push / Pull / Legs</option>
                <option value="Upper / Lower Split">Upper / Lower Split</option>
                <option value="Full Body Hypertrophy">Full Body Hypertrophy</option>
                <option value="Strength & Powerlifting">Strength & Powerlifting</option>
                <option value="Cardio & Conditioning">Cardio & Conditioning</option>
                <option value="Mobility & Recovery">Mobility & Recovery</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Routine Notes / Coaching Focus</label>
            <textarea
              rows={2}
              placeholder="e.g. Warm up rotator cuffs. Focus on mind-muscle connection and 2-second negative."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800/80 border border-white/[0.1] rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Exercises Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Exercises ({exercises.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Configure sets, target reps, weight & rest timers for each movement
                </p>
              </div>

              <Button
                variant="accent-emerald"
                size="sm"
                onClick={() => setIsExercisePickerOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Exercise
              </Button>
            </div>

            {/* Exercise Accordion Cards */}
            <div className="space-y-3">
              {exercises.map((ex, exIdx) => {
                const isExpanded = expandedIndex === exIdx;

                return (
                  <div
                    key={ex.id}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedIndex(isExpanded ? -1 : exIdx)}
                      className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-white/[0.06] text-xs font-bold text-slate-300 flex items-center justify-center">
                          {exIdx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-white">{ex.exerciseName}</p>
                          <p className="text-xs text-slate-400">
                            {ex.primaryMuscle} • {ex.equipment} • {ex.sets.length} Sets • {ex.restTimeSeconds}s Rest
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveExercise(exIdx);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Remove exercise"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-white/[0.06] space-y-4 bg-slate-950/30">
                        {/* Rest timer & exercise note settings */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-blue-400 shrink-0" />
                            <label className="text-xs text-slate-300 whitespace-nowrap">Rest Time:</label>
                            <select
                              value={ex.restTimeSeconds}
                              onChange={(e) =>
                                handleUpdateExerciseNotesOrRest(exIdx, 'restTimeSeconds', parseInt(e.target.value, 10))
                              }
                              className="bg-slate-800 border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs text-white"
                            >
                              <option value="30">30 seconds</option>
                              <option value="60">60 seconds</option>
                              <option value="90">90 seconds (Standard)</option>
                              <option value="120">120 seconds (2 mins)</option>
                              <option value="180">180 seconds (3 mins heavy)</option>
                            </select>
                          </div>

                          <input
                            type="text"
                            placeholder="Technique cue (e.g. Pause at bottom)"
                            value={ex.notes || ''}
                            onChange={(e) =>
                              handleUpdateExerciseNotesOrRest(exIdx, 'notes', e.target.value)
                            }
                            className="bg-slate-800 border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500"
                          />
                        </div>

                        {/* Sets Editor Table */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                            <div className="col-span-2 text-center">Set</div>
                            <div className="col-span-4 text-center">Target Weight (lbs)</div>
                            <div className="col-span-4 text-center">Target Reps</div>
                            <div className="col-span-2 text-center">Action</div>
                          </div>

                          {ex.sets.map((set, setIdx) => (
                            <div
                              key={set.id}
                              className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-white/[0.03] border border-white/[0.04]"
                            >
                              <div className="col-span-2 text-center">
                                <span className="text-xs font-bold text-slate-300 bg-white/[0.06] px-2 py-0.5 rounded">
                                  {set.setNumber}
                                </span>
                              </div>

                              <div className="col-span-4 flex justify-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="1500"
                                  value={set.targetWeight}
                                  onChange={(e) =>
                                    handleUpdateSet(exIdx, setIdx, {
                                      targetWeight: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="w-20 bg-slate-800 border border-white/[0.1] rounded-lg px-2 py-1 text-center text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                                />
                              </div>

                              <div className="col-span-4 flex justify-center">
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={set.targetReps}
                                  onChange={(e) =>
                                    handleUpdateSet(exIdx, setIdx, {
                                      targetReps: parseInt(e.target.value, 10) || 0,
                                    })
                                  }
                                  className="w-16 bg-slate-800 border border-white/[0.1] rounded-lg px-2 py-1 text-center text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                                />
                              </div>

                              <div className="col-span-2 flex justify-center">
                                {ex.sets.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSet(exIdx, setIdx)}
                                    className="text-slate-500 hover:text-rose-400 p-1"
                                    title="Delete set"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleAddSet(exIdx)}
                            className="w-full py-1.5 rounded-xl border border-dashed border-white/[0.1] text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Set
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-between bg-slate-900/90">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={saving}
              onClick={handleSaveOnly}
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Routine
            </Button>
            <Button
              variant="accent-emerald"
              size="sm"
              disabled={saving}
              onClick={handleSaveAndStart}
            >
              <Play className="w-4 h-4 mr-1.5" />
              Save & Start Workout
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Exercise Picker Modal */}
      <AnimatePresence>
        {isExercisePickerOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-slate-900 border border-white/[0.15] rounded-2xl p-5 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white">Select Exercise to Add</h3>
                <button
                  onClick={() => setIsExercisePickerOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search 40+ exercises by movement or muscle..."
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-white/[0.1] rounded-xl pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Muscle Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                {['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Core', 'Cardio'].map(
                  (m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMuscleFilter(m)}
                      className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium transition-colors ${
                        muscleFilter === m
                          ? 'bg-blue-500 text-white font-bold'
                          : 'bg-white/[0.05] text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  )
                )}
              </div>

              {/* Results list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {filteredLibrary.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => handleAddExerciseFromLibrary(ex.id)}
                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {ex.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {ex.primaryMuscle} • {ex.equipment} • {ex.category}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" className="pointer-events-none text-xs">
                      + Add
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
