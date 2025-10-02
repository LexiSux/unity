import { useState } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AvailableNowButtonProps {
  listingId: string;
  currentStatus: boolean;
}

export default function AvailableNowButton({ listingId, currentStatus }: AvailableNowButtonProps) {
  const [isAvailable, setIsAvailable] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const toggleAvailableNow = async () => {
    setLoading(true);
    try {
      const newStatus = !isAvailable;
      const availableUntil = newStatus
        ? new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('listings')
        .update({
          available_now: newStatus,
          available_until: availableUntil,
        })
        .eq('id', listingId);

      if (error) throw error;

      setIsAvailable(newStatus);
    } catch (error) {
      console.error('Error toggling available now:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleAvailableNow}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        isAvailable
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isAvailable ? <CheckCircle size={18} /> : <Clock size={18} />}
      <span>{isAvailable ? 'Available Now (Active)' : 'Mark Available Now'}</span>
    </button>
  );
}
