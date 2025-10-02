import { useState, useEffect } from 'react';
import { X, Sparkles, Pin, Image as ImageIcon, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Listing } from '../lib/supabase';

interface UpgradesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UpgradeOption {
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  durationDays: number;
}

const upgradeOptions: UpgradeOption[] = [
  {
    type: 'image_rotation',
    name: 'Image Rotation',
    description: 'Showcase multiple images in a rotating slideshow on your listing card',
    icon: <ImageIcon size={24} />,
    durationDays: 30,
  },
  {
    type: 'highlight',
    name: 'Highlighted Listing',
    description: 'Make your listing stand out with a special border and sparkle effect',
    icon: <Sparkles size={24} />,
    durationDays: 30,
  },
  {
    type: 'sticky',
    name: 'Sticky Ad',
    description: 'Pin your listing to the top of search results in your location category',
    icon: <Pin size={24} />,
    durationDays: 7,
  },
  {
    type: 'available_now_extended',
    name: 'Extended Available Now',
    description: 'Keep your "Available Now" status active for 24 hours instead of 4',
    icon: <Clock size={24} />,
    durationDays: 1,
  },
];

export default function UpgradesModal({ isOpen, onClose }: UpgradesModalProps) {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && profile?.user_type === 'entertainer') {
      loadListings();
    }
  }, [isOpen, profile]);

  const loadListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user?.id)
      .eq('is_active', true);

    if (data) setListings(data);
  };

  const handlePurchase = async (upgradeType: string, durationDays: number) => {
    if (!selectedListing) {
      alert('Please select a listing first');
      return;
    }

    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      const { error: upgradeError } = await supabase
        .from('upgrades')
        .insert({
          listing_id: selectedListing,
          upgrade_type: upgradeType,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        });

      if (upgradeError) throw upgradeError;

      const { error: purchaseError } = await supabase
        .from('upgrade_purchases')
        .insert({
          user_id: user?.id,
          listing_id: selectedListing,
          upgrade_type: upgradeType,
          duration_days: durationDays,
        });

      if (purchaseError) throw purchaseError;

      alert('Upgrade activated successfully!');
      onClose();
    } catch (error) {
      console.error('Error purchasing upgrade:', error);
      alert('Failed to activate upgrade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || profile?.user_type !== 'entertainer') return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-zinc-900 rounded-lg max-w-4xl w-full p-8 relative border border-zinc-800 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Premium Upgrades</h2>
        <p className="text-zinc-400 mb-6">
          Boost your visibility and engagement with à la carte premium features
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Select Listing to Upgrade
          </label>
          <select
            value={selectedListing}
            onChange={(e) => setSelectedListing(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Choose a listing...</option>
            {listings.map(listing => (
              <option key={listing.id} value={listing.id}>
                {listing.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {upgradeOptions.map((upgrade) => (
            <div
              key={upgrade.type}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 hover:border-red-600/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-red-600/10 p-3 rounded-lg text-red-600">
                  {upgrade.icon}
                </div>
                <span className="text-zinc-400 text-sm font-medium">
                  {upgrade.durationDays} day{upgrade.durationDays > 1 ? 's' : ''}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{upgrade.name}</h3>
              <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                {upgrade.description}
              </p>
              <button
                onClick={() => handlePurchase(upgrade.type, upgrade.durationDays)}
                disabled={!selectedListing || loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Activate'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
          <p className="text-sm text-zinc-400">
            <strong className="text-white">Note:</strong> This is a demonstration platform.
            In production, payment processing would be integrated here. All upgrades are
            currently activated for free to showcase the features.
          </p>
        </div>
      </div>
    </div>
  );
}
