import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setTimeout(() => setShow(true), 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50"
        >
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl">
            <div className="flex items-start gap-4">
              <Cookie className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-medium text-white mb-2">Cookie Notice</h3>
                <p className="text-sm text-neutral-400 mb-4">
                  We use cookies to enhance your experience, analyze traffic, and remember your preferences.
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleAccept} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    Accept
                  </Button>
                  <Button onClick={handleDecline} size="sm" variant="outline" className="border-neutral-700">
                    Decline
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}