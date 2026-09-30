import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { hasProfile, profile } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Digital Twin', href: '/digital-twin' },
    { label: 'AI Stylist', href: '/stylist' },
    { label: 'Discover', href: '/discover' },
    { label: 'Saved Looks', href: '/saved' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#E7E5DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <Link
          to="/"
          className="text-xl md:text-2xl font-editorial font-medium tracking-tight text-[#20211F] hover:text-[#244D3C] transition-colors shrink-0"
        >
          FitTwin AI
        </Link>

        {/* Zone 2: Navigation Links (Clean text links with subtle hover/active underlines) */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map(link => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs uppercase tracking-widest font-medium transition-colors relative py-1 ${
                  active
                    ? 'text-[#244D3C] font-semibold'
                    : 'text-[#20211F]/70 hover:text-[#20211F]'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#244D3C]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="hidden md:flex items-center gap-3">
          {hasProfile ? (
            <Link
              to="/digital-twin"
              className="flex items-center gap-2 px-3.5 py-1.5 border border-[#E7E5DF] hover:border-[#244D3C] bg-white text-xs uppercase tracking-wider text-[#20211F] transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#244D3C]" />
              <span className="truncate max-w-[120px]">{profile?.displayName || 'My Twin'}</span>
            </Link>
          ) : (
            <Link
              to="/create-profile"
              className="px-4 py-2 bg-[#244D3C] hover:bg-[#19382C] text-white text-xs uppercase tracking-widest font-medium transition-colors shadow-2xs whitespace-nowrap"
            >
              Create My Digital Twin
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="p-2 text-[#20211F] hover:bg-[#EBE8E1] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E7E5DF] bg-[#F8F7F4] px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs uppercase tracking-widest py-2 text-[#20211F]/70 hover:text-[#20211F]"
            >
              Home
            </Link>
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-xs uppercase tracking-widest py-2 ${
                  isActive(link.href)
                    ? 'text-[#244D3C] font-semibold'
                    : 'text-[#20211F]/70 hover:text-[#20211F]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs uppercase tracking-widest py-2 text-[#20211F]/70 hover:text-[#20211F]"
            >
              Settings
            </Link>
          </div>

          <div className="pt-3 border-t border-[#E7E5DF]">
            <Link
              to="/create-profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full py-2.5 text-center bg-[#244D3C] text-white text-xs uppercase tracking-widest font-medium"
            >
              {hasProfile ? 'Edit Digital Twin' : 'Create My Digital Twin'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
