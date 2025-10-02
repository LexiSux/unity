import { User, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onAuthClick: () => void;
  onCreateClick: () => void;
}

export default function Header({ onAuthClick, onCreateClick }: HeaderProps) {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="bg-black border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              <span className="text-red-600">UNITY</span>
            </h1>
            <nav className="hidden md:flex space-x-6">
              <a href="#browse" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">
                Browse
              </a>
              <a href="#available" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">
                Available Now
              </a>
              {profile?.user_type === 'entertainer' && (
                <a href="#upgrades" className="text-zinc-300 hover:text-white transition-colors text-sm font-medium">
                  Upgrades
                </a>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={onCreateClick}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  <Plus size={18} />
                  <span>Create Listing</span>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{profile?.display_name}</div>
                    <div className="text-xs text-zinc-400 capitalize">
                      {profile?.user_type.replace('_', ' ')}
                    </div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                <User size={18} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
