import EventHorizonGame from '@/components/game/EventHorizonGame';

const Index = () => {
  return (
    <div className="min-h-screen bg-[hsl(160,30%,3%)] flex flex-col items-center justify-center p-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-mono font-bold text-[hsl(140,100%,50%)] tracking-widest mb-1">
          EVENT HORIZON
        </h1>
        <p className="text-sm font-mono text-[hsl(280,80%,60%)] tracking-[0.3em]">
          THE DECOHERENCE
        </p>
      </div>
      <EventHorizonGame />
      <p className="mt-6 text-xs font-mono text-[hsl(120,20%,30%)] max-w-md text-center">
        A quantum physics space shooter. Defeat enemies in superposition, 
        navigate entanglement, and master the uncertainty principle across 6 levels.
      </p>
    </div>
  );
};

export default Index;
