import { Shield, Users, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-b from-zinc-900 to-black py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Community-Owned.<br />
            <span className="text-red-600">Worker-Empowered.</span>
          </h2>
          <p className="text-xl text-zinc-300 max-w-3xl mx-auto leading-relaxed">
            A platform built by independent workers, for independent workers. No unfair fees,
            no exploitation. Just a safe, modern space for our diverse community to connect.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-8 hover:border-red-600/50 transition-colors">
            <div className="bg-red-600/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <Shield className="text-red-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Safe & Secure</h3>
            <p className="text-zinc-400 leading-relaxed">
              Built with worker safety and privacy as the top priority. Your data, your control.
            </p>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-8 hover:border-red-600/50 transition-colors">
            <div className="bg-red-600/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <Users className="text-red-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Inclusive Community</h3>
            <p className="text-zinc-400 leading-relaxed">
              Open to entertainers and non-entertainers alike. Everyone deserves a voice.
            </p>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-8 hover:border-red-600/50 transition-colors">
            <div className="bg-red-600/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <Zap className="text-red-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Free to Start</h3>
            <p className="text-zinc-400 leading-relaxed">
              All entertainers start with a free tier. Upgrade only when you need it, à la carte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
