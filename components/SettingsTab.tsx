import { Settings } from 'lucide-react';

const LINE_GREEN = '#06C755';

interface SettingsTabProps {
  onClick: () => void;
}

export function SettingsTab({ onClick }: SettingsTabProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 left-0 z-30 flex items-center justify-center p-3 rounded-r-lg shadow-lg text-white transition-all hover:pl-4"
      style={{ backgroundColor: LINE_GREEN }}
      title="Settings & Options"
    >
      <Settings className="h-5 w-5" />
    </button>
  );
}
