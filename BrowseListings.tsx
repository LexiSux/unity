import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase, Listing } from '../lib/supabase';
import ListingCard from './ListingCard';

export default function BrowseListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  useEffect(() => {
    loadListings();
  }, [selectedLocation, selectedCategory, showAvailableOnly]);

  const loadListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedLocation) {
        query = query.eq('location', selectedLocation);
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (showAvailableOnly) {
        query = query.eq('available_now', true);
      }

      const { data: listingsData } = await query;

      if (listingsData) {
        const { data: upgradesData } = await supabase
          .from('upgrades')
          .select('*')
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString());

        const stickyListingIds = upgradesData
          ?.filter(u => u.upgrade_type === 'sticky')
          .map(u => u.listing_id) || [];

        const sorted = listingsData.sort((a, b) => {
          const aIsSticky = stickyListingIds.includes(a.id);
          const bIsSticky = stickyListingIds.includes(b.id);

          if (aIsSticky && !bIsSticky) return -1;
          if (!aIsSticky && bIsSticky) return 1;
          return 0;
        });

        setListings(sorted);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const locations = [...new Set(listings.map(l => l.location))];
  const categories = [...new Set(listings.map(l => l.category))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-6">Browse Listings</h2>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
              className="w-5 h-5 rounded bg-zinc-900 border-zinc-700 text-red-600 focus:ring-red-500"
            />
            <span className="text-zinc-300 font-medium">Available Now Only</span>
          </label>

          <button
            onClick={loadListings}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            <Filter size={18} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredListings.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-zinc-400 text-lg">No listings found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
