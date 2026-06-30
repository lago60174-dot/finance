import type { GamificationSummary } from "@/lib/gamification";

export default function BadgesPanel({ summary }: { summary: GamificationSummary }) {
  const earnedCount = summary.badges.filter((b) => b.earned).length;

  return (
    <div className="border border-line rounded-lg bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/50">Progression</p>
          <p className="text-sm font-medium">
            Niveau {summary.level.name} · {earnedCount}/{summary.badges.length} badges
          </p>
        </div>
        {summary.streakDays > 0 && (
          <span className="text-xs bg-clay/10 text-clay px-2 py-1 rounded-md font-medium">
            🔥 {summary.streakDays} j de suite
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {summary.badges.map((b) => (
          <div
            key={b.id}
            title={b.description}
            className={`flex flex-col items-center text-center rounded-md p-2 ${
              b.earned ? "bg-moss/5" : "bg-paper opacity-40"
            }`}
          >
            <span className="text-xl">{b.emoji}</span>
            <span className="text-[10px] mt-1 leading-tight">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
