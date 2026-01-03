import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, Music, Heart, Users, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user.preferences?.onboardingComplete) {
        window.location.href = createPageUrl('Home');
      }
      setUser(user);
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const handleComplete = async () => {
    await base44.auth.updateMe({
      preferences: { ...user.preferences, onboardingComplete: true }
    });
    window.location.href = createPageUrl('Home');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-8 bg-neutral-900 border-neutral-800">
        {step === 1 && (
          <div className="space-y-6 text-center">
            <div className="text-6xl mb-4">◆</div>
            <h1 className="text-4xl font-light text-white">Welcome to VANTA</h1>
            <p className="text-lg text-neutral-400">
              Experience music, not streams. Let's personalize your journey.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 pt-8">
              <div className="p-4 bg-neutral-800/50 rounded-lg">
                <Music className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                <h3 className="font-medium text-white mb-2">Complete Experiences</h3>
                <p className="text-sm text-neutral-400">Albums, events, sessions - not individual tracks</p>
              </div>
              <div className="p-4 bg-neutral-800/50 rounded-lg">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <h3 className="font-medium text-white mb-2">Support Artists</h3>
                <p className="text-sm text-neutral-400">Transparent revenue, fair payouts</p>
              </div>
              <div className="p-4 bg-neutral-800/50 rounded-lg">
                <Users className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-medium text-white mb-2">Own Your Collection</h3>
                <p className="text-sm text-neutral-400">Permanent access, no subscriptions</p>
              </div>
            </div>

            <Button onClick={() => setStep(2)} className="mt-8 bg-indigo-600 hover:bg-indigo-700">
              Get Started
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-light text-white mb-2">What interests you?</h2>
              <p className="text-neutral-400">Select the types of experiences you'd like to explore</p>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {['album', 'single', 'event', 'session', 'archive'].map(type => (
                <label
                  key={type}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTypes.includes(type)
                      ? 'border-indigo-600 bg-indigo-600/10'
                      : 'border-neutral-800 bg-neutral-800/50 hover:border-neutral-700'
                  }`}
                >
                  <Checkbox
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTypes([...selectedTypes, type]);
                      } else {
                        setSelectedTypes(selectedTypes.filter(t => t !== type));
                      }
                    }}
                  />
                  <span className="text-white capitalize">{type}s</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1 border-neutral-700">
                Back
              </Button>
              <Button onClick={handleComplete} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                Complete Setup
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}