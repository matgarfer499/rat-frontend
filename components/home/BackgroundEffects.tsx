export function BackgroundEffects() {
  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
      />
      <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent z-0 pointer-events-none" />
    </>
  );
}
