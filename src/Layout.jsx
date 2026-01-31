import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { Home, Compass, Plus, User, LogOut, Heart, Bell, Search, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import GlobalSearch from './components/search/GlobalSearch';
import OfflineIndicator from './components/features/OfflineIndicator';
import CookieConsent from './components/features/CookieConsent';
import { ErrorBoundary } from './components/features/ErrorBoundary';
import KeyboardShortcuts from './components/system/KeyboardShortcuts';
import ThemeSwitcher from './components/system/ThemeSwitcher';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => user ? base44.entities.Notification.filter({ userId: user.id, read: false }) : [],
    enabled: !!user,
    initialData: []
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  const canCreate = user && ['ARTIST', 'LABEL', 'ADMIN'].includes(user.role);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <style>{`
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        ::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3a3a3a;
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-3 group">
            <div className="text-2xl">◆</div>
            <span className="text-xl font-light tracking-wider group-hover:text-indigo-400 transition-colors">
              VANTA
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900/50 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            <Link
              to={createPageUrl('Home')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPageName === 'Home'
                  ? 'text-white bg-neutral-900'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
              }`}
            >
              <Home className="w-4 h-4" />
            </Link>

            {user && (
              <>
                <Link
                  to={createPageUrl('Vault')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPageName === 'Vault'
                      ? 'text-white bg-neutral-900'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                </Link>

                <Link
                  to={createPageUrl('Favorites')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPageName === 'Favorites'
                      ? 'text-white bg-neutral-900'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                </Link>

                <Link
                  to={createPageUrl('Notifications')}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPageName === 'Notifications'
                      ? 'text-white bg-neutral-900'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Link>

                <Link
                  to={createPageUrl('Messages')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPageName === 'Messages'
                      ? 'text-white bg-neutral-900'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>
                </>
                )}

                {canCreate && (
                  <Link
                    to={createPageUrl('StudioDashboard')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPageName === 'StudioDashboard'
                        ? 'text-white bg-neutral-900'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </Link>
                )}

                <ThemeSwitcher />

                {user ? (
              <>
                <Link
                  to={createPageUrl('Account')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPageName === 'Account'
                      ? 'text-white bg-neutral-900'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
                  }`}
                >
                  <User className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => base44.auth.redirectToLogin()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-900/50 transition-colors"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Main */}
      <main className="pt-16">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {/* Global Search */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Cookie Consent */}
      <CookieConsent />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts />

      {/* Footer */}
      <footer className="border-t border-neutral-900 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-xl mb-4">◆ VANTA</div>
              <p className="text-sm text-neutral-500">Experience Music. Not streams.</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Platform</h4>
              <div className="space-y-2 text-sm text-neutral-500">
                <Link to={createPageUrl('Documentation')} className="block hover:text-white">Documentation</Link>
                <Link to={createPageUrl('Terms')} className="block hover:text-white">Terms of Service</Link>
                <Link to={createPageUrl('Privacy')} className="block hover:text-white">Privacy Policy</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-3">For Artists</h4>
              <div className="space-y-2 text-sm text-neutral-500">
                <Link to={createPageUrl('StudioDashboard')} className="block hover:text-white">Studio</Link>
                <Link to={createPageUrl('LabelConsole')} className="block hover:text-white">Label Console</Link>
                <Link to={createPageUrl('PublisherPortal')} className="block hover:text-white">Publisher Portal</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Community</h4>
              <div className="space-y-2 text-sm text-neutral-500">
                <Link to={createPageUrl('Trending')} className="block hover:text-white">Trending</Link>
                <Link to={createPageUrl('Collections')} className="block hover:text-white">Collections</Link>
                <Link to={createPageUrl('Leaderboard')} className="block hover:text-white">Leaderboard</Link>
                <Link to={createPageUrl('BeatsMarketplace')} className="block hover:text-white">Beats</Link>
                <Link to={createPageUrl('Academy')} className="block hover:text-white">Academy</Link>
                <Link to={createPageUrl('VirtualEvents')} className="block hover:text-white">Virtual Events</Link>
                <Link to={createPageUrl('StudioBookings')} className="block hover:text-white">Studio Bookings</Link>
                <Link to={createPageUrl('ActivityFeed')} className="block hover:text-white">Activity Feed</Link>
                <Link to={createPageUrl('Favorites')} className="block hover:text-white">My Favorites</Link>
                <Link to={createPageUrl('Vault')} className="block hover:text-white">My Vault</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-900 text-center text-sm text-neutral-600">
            © 2026 VANTA. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}