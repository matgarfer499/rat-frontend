import { Suspense } from 'react';
import { JoinRoomContent } from '@components/multiplayer/JoinRoomContent';

export default function JoinRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-game px-4">
          <div className="w-12 h-12 border-4 border-purple-light border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <JoinRoomContent />
    </Suspense>
  );
}
