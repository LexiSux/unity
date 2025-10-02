import { useState, useEffect } from 'react';
import { MapPin, Clock, Sparkles, Pin } from 'lucide-react';
import { Listing, Upgrade, supabase } from '../lib/supabase';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);

  useEffect(() => {
    loadUpgrades();
  }, [listing.id]);

  const loadUpgrades = async () => {
    const { data } = await supabase
      .from('upgrades')
      .select('*')
      .eq('listing_id', listing.id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString());

    if (data) setUpgrades(data);
  };

  const hasUpgrade = (type: string) => upgrades.some(u => u.upgrade_type === type);
  const isHighlighted = hasUpgrade('highlight');
  const isSticky = hasUpgrade('sticky');
  const hasImageRotation = hasUpgrade('image_rotation');

  useEffect(() => {
    if (hasImageRotation && listing.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [hasImageRotation, listing.images.length]);

  const images = listing.images.length > 0 ? listing.images : ['https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=800'];

  return (
    <div
      className={`bg-zinc-900 rounded-xl overflow-hidden border transition-all hover:scale-[1.02] ${
        isHighlighted
          ? 'border-red-600 shadow-lg shadow-red-600/20'
          : 'border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-800">
        <img
          src={images[currentImageIndex]}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {isSticky && (
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Pin size={12} />
              Featured
            </span>
          )}
          {listing.available_now && (
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 animate-pulse">
              <Clock size={12} />
              Available Now
            </span>
          )}
        </div>
        {isHighlighted && (
          <div className="absolute top-3 right-3">
            <Sparkles className="text-red-600" size={20} />
          </div>
        )}
        {hasImageRotation && listing.images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1">
            {listing.images.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{listing.title}</h3>
        <div className="flex items-center text-zinc-400 text-sm mb-3">
          <MapPin size={14} className="mr-1" />
          <span>{listing.location}</span>
          <span className="mx-2">•</span>
          <span className="text-zinc-500">{listing.category}</span>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed line-clamp-3 mb-4">
          {listing.description}
        </p>
        <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}
