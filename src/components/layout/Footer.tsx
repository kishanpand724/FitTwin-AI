import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#20211F] text-[#F8F7F4] border-t border-[#31332F] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#31332F]">
          {/* Brand Col */}
          <div className="md:col-span-4">
            <span className="text-2xl font-editorial tracking-tight text-white block mb-3">
              FitTwin AI
            </span>
            <p className="text-xs text-[#F8F7F4]/60 leading-relaxed max-w-sm mb-4">
              Your body. Your style. Your digital twin. Discover outfits tailored to your exact
              measurements and personal aesthetic without the guesswork of generic sizing.
            </p>
            <div className="text-[11px] text-[#A6B6A3]">
              <span>Curated in Paris, Tokyo & New York</span>
            </div>
          </div>

          {/* Nav Col 1 */}
          <div className="md:col-span-2">
            <h5 className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-4">
              Navigation
            </h5>
            <ul className="space-y-2.5 text-xs text-[#F8F7F4]/70">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link to="/digital-twin" className="hover:text-white transition-colors">
                  My Digital Twin
                </Link>
              </li>
              <li>
                <Link to="/stylist" className="hover:text-white transition-colors">
                  AI Stylist
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-white transition-colors">
                  Discover Outfits
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-white transition-colors">
                  Saved Looks
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div className="md:col-span-3">
            <h5 className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-4">
              Fashion Tech
            </h5>
            <ul className="space-y-2.5 text-xs text-[#F8F7F4]/70">
              <li>
                <Link to="/create-profile" className="hover:text-white transition-colors">
                  Profile Calibration
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-white transition-colors">
                  Unit Conversion & Privacy
                </Link>
              </li>
              <li>
                <span className="text-[#F8F7F4]/40">GLTF 3D Fit Engine (Beta)</span>
              </li>
              <li>
                <span className="text-[#F8F7F4]/40">Gemini Styling Grounding (Upcoming)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Principles */}
          <div className="md:col-span-3">
            <h5 className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-4">
              Design Philosophy
            </h5>
            <p className="text-xs text-[#F8F7F4]/60 leading-relaxed mb-3">
              We reject vanity sizing and fast-fashion throwaway culture. Every recommendation is
              proportion-aware, respectful of your measurements, and built for timeless longevity.
            </p>
            <div className="flex items-center gap-3 text-xs text-[#A6B6A3]">
              <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
              <span>·</span>
              <span className="hover:text-white cursor-pointer transition-colors">Vogue Runway</span>
              <span>·</span>
              <span className="hover:text-white cursor-pointer transition-colors">Substack</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F8F7F4]/40 gap-4">
          <p>© {new Date().getFullYear()} FitTwin AI. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <Link to="/settings" className="hover:text-white transition-colors">
              Data Privacy
            </Link>
            <Link to="/settings" className="hover:text-white transition-colors">
              Prototype Reset
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
