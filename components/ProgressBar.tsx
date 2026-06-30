export default function ProgressBar({
  percent,
  colorClass = "bg-moss",
}: {
  percent: number;
  colorClass?: string;
}) {
  return (
    <div className="w-full h-2 bg-line rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClass} rounded-full transition-all`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
