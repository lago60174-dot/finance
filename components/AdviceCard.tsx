import type { Tip } from "@/lib/advisor";

const TONE_STYLES: Record<Tip["tone"], string> = {
  positive: "border-income/20 bg-income/5",
  warning: "border-clay/30 bg-clay/5",
  neutral: "border-line bg-white",
};

const TONE_EMOJI: Record<Tip["tone"], string> = {
  positive: "✅",
  warning: "⚠️",
  neutral: "💡",
};

export default function AdviceCard({ tip }: { tip: Tip }) {
  return (
    <div className={`border rounded-lg p-4 mb-3 ${TONE_STYLES[tip.tone]}`}>
      <p className="text-sm font-medium mb-1">
        {TONE_EMOJI[tip.tone]} {tip.title}
      </p>
      <p className="text-xs text-ink/60">{tip.detail}</p>
    </div>
  );
}
