import React, { useState } from 'react';
import {
  Dumbbell,
  Play,
  Plus,
  Copy,
  Trash2,
  Edit3,
  Clock,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useFitness } from '../../contexts/FitnessContext';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { WorkoutTemplate } from '../../types/fitness';

interface WorkoutPlannerViewProps {
  onOpenBuilder: (template?: WorkoutTemplate) => void;
}

export const WorkoutPlannerView: React.FC<WorkoutPlannerViewProps> = ({
  onOpenBuilder,
}) => {
  const { templates, startWorkout, deleteTemplate, saveTemplate } = useFitness();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  const categories = ['All', 'Push / Pull / Legs', 'Upper / Lower Split', 'Full Body Hypertrophy', 'Strength & Powerlifting', 'Cardio & Conditioning'];

  const filteredTemplates = templates.filter((tpl) => {
    if (selectedCategory === 'All') return true;
    return tpl.category === selectedCategory;
  });

  const handleDuplicate = async (tpl: WorkoutTemplate) => {
    await saveTemplate({
      name: `${tpl.name} (Copy)`,
      category: tpl.category,
      description: tpl.description,
      exercises: tpl.exercises.map((ex) => ({
        ...ex,
        id: `we-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sets: ex.sets.map((s) => ({ ...s, id: `s-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` })),
      })),
      targetMuscleGroups: tpl.targetMuscleGroups,
      estimatedDurationMinutes: tpl.estimatedDurationMinutes,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Workout Planner & Split Routines
          </h2>
          <p className="text-sm text-slate-400">
            Structure training cycles, progressive overload splits, and set protocols.
          </p>
        </div>

        <Button
          variant="accent-emerald"
          size="md"
          onClick={() => onOpenBuilder()}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Routine
        </Button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((tpl) => {
          const isExpanded = expandedTemplateId === tpl.id;
          const totalSets = tpl.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

          return (
            <GlassCard
              key={tpl.id}
              className="p-5 flex flex-col justify-between space-y-4 hover:border-white/[0.15] transition-all"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="blue" size="sm">
                        {tpl.category}
                      </Badge>
                      {tpl.isPrebuilt && (
                        <Badge variant="emerald" size="sm">
                          Verified Protocol
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {tpl.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(tpl)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06]"
                      title="Duplicate Routine"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {!tpl.isPrebuilt && (
                      <>
                        <button
                          onClick={() => onOpenBuilder(tpl)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06]"
                          title="Edit Routine"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete routine "${tpl.name}"?`)) {
                              deleteTemplate(tpl.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/[0.06]"
                          title="Delete Routine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {tpl.description && (
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                    {tpl.description}
                  </p>
                )}

                {/* Routine Key Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Exercises</span>
                    <p className="font-bold text-white mt-0.5">{tpl.exercises.length}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Total Sets</span>
                    <p className="font-bold text-blue-400 mt-0.5">{totalSets}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Est. Duration</span>
                    <p className="font-bold text-emerald-400 mt-0.5">
                      ~{tpl.estimatedDurationMinutes} min
                    </p>
                  </div>
                </div>

                {/* Target Muscle Badges */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {tpl.targetMuscleGroups?.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[11px] text-slate-300 font-medium"
                    >
                      {m}
                    </span>
                  ))}
                </div>

                {/* Expandable Exercise Breakdown */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Exercise Breakdown:
                    </p>
                    {tpl.exercises.map((ex, i) => (
                      <div
                        key={ex.id || i}
                        className="p-2.5 rounded-lg bg-white/[0.03] flex justify-between items-center text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">
                            {i + 1}. {ex.exerciseName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {ex.primaryMuscle} • {ex.equipment}
                          </p>
                        </div>
                        <span className="font-semibold text-blue-400">
                          {ex.sets.length} Sets • {ex.restTimeSeconds}s Rest
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Bottom Bar */}
              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-2">
                <button
                  onClick={() => setExpandedTemplateId(isExpanded ? null : tpl.id)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      Hide Details <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      View Details ({tpl.exercises.length}) <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <Button
                  variant="accent-emerald"
                  size="sm"
                  onClick={() => startWorkout(tpl)}
                >
                  <Play className="w-3.5 h-3.5 mr-1" />
                  Start Workout
                </Button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
