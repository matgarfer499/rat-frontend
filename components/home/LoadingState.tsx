export function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-purple-light text-xl animate-pulse">
        {/* Loading state without text to avoid flash */}
      </div>
    </div>
  );
}
