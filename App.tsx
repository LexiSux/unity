import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import BrowseListings from './components/BrowseListings';
import AuthModal from './components/AuthModal';
import CreateListingModal from './components/CreateListingModal';
import UpgradesModal from './components/UpgradesModal';

function AppContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradesModal, setShowUpgradesModal] = useState(false);
  const [refreshListings, setRefreshListings] = useState(0);
  const { user, loading } = useAuth();

  const handleCreateClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleCreateSuccess = () => {
    setRefreshListings(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header
        onAuthClick={() => setShowAuthModal(true)}
        onCreateClick={handleCreateClick}
      />

      <Hero />

      <BrowseListings key={refreshListings} />

      <footer className="bg-zinc-900 border-t border-zinc-800 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            <span className="text-red-600">UNITY</span> Platform
          </h3>
          <p className="text-zinc-400 mb-6 max-w-2xl mx-auto leading-relaxed">
            A community-owned platform built by workers, for workers.
            We stand together for fair treatment, safety, and empowerment.
          </p>
          <div className="flex justify-center gap-6 text-sm text-zinc-500">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#community" className="hover:text-white transition-colors">Community Guidelines</a>
            <a href="#support" className="hover:text-white transition-colors">Support</a>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <CreateListingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <UpgradesModal
        isOpen={showUpgradesModal}
        onClose={() => setShowUpgradesModal(false)}
      />

      {user && (
        <button
          onClick={() => setShowUpgradesModal(true)}
          className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow-lg shadow-red-600/30 font-medium transition-all hover:scale-105"
        >
          View Upgrades
        </button>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
