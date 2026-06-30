export default function EncouragementBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="border border-moss/20 bg-moss/5 rounded-lg px-4 py-3 mb-4 text-sm text-moss">
      {message}
    </div>
  );
}
