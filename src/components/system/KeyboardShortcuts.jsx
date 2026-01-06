import { useEffect, useState } from 'react';
import { Command } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const shortcuts = [
    { key: 'K', action: 'Open search', handler: () => {} },
    { key: 'H', action: 'Go home', handler: () => navigate(createPageUrl('Home')) },
    { key: 'V', action: 'Open vault', handler: () => navigate(createPageUrl('Vault')) },
    { key: 'S', action: 'Open studio', handler: () => navigate(createPageUrl('StudioDashboard')) },
    { key: '/', action: 'Show shortcuts', handler: () => setOpen(true) },
    { key: 'Space', action: 'Play/Pause', handler: () => {} },
    { key: '→', action: 'Next track', handler: () => {} },
    { key: '←', action: 'Previous track', handler: () => {} }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      
      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault();
        // Trigger global search
      } else if (key === '/') {
        e.preventDefault();
        setOpen(true);
      } else if (e.altKey) {
        const shortcut = shortcuts.find(s => s.key.toLowerCase() === key);
        if (shortcut) {
          e.preventDefault();
          shortcut.handler();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Command className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {shortcuts.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-neutral-800/50 rounded">
              <span className="text-sm text-neutral-300">{shortcut.action}</span>
              <kbd className="px-2 py-1 bg-neutral-700 rounded text-xs text-white font-mono">
                Alt + {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}