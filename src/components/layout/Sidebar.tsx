import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Sparkles,
  Compass,
  Bookmark,
  Settings,
  Ruler,
  PlusCircle,
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

export const Sidebar: React.FC = () => {
  const { hasProfile, profile, savedLooks } = useProfile();

  const links = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { label: 'My Digital Twin', to: '/digital-twin', icon: User },
    { label: 'AI Stylist', to: '/stylist', icon: Sparkles },
    { label: 'Discover', to: '/discover', icon: Compass },
    {
      label: 'Saved Looks',
      to: '/saved',
      icon: Bookmark,
      badge: savedLooks.length > 0 ? savedLooks.length : undefined,
    },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#F8F7F4] border-r border-[#E7E5DF] shrink-0 flex flex-col justify-between py-6 px-4 hidden lg:flex min-h-[calc(100vh-4rem)]">
      <div>
        {/* Profile Status Box */}
        <div className="p-3.5 bg-white border border-[#E7E5DF] mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E8EDE7] flex items-center justify-center text-[#244D3C] font-editorial text-sm font-semibold shrink-0">
              {hasProfile && profile?.displayName ? profile.displayName.charAt(0) : 'T'}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-[#20211F] block truncate">
                {hasProfile ? profile?.displayName : 'Guest Stylist'}
              </span>
              <span className="text-[11px] text-[#20211F]/60 block truncate">
                {hasProfile ? 'Digital Twin Active' : 'Profile Incomplete'}
              </span>
            </div>
          </div>

          {!hasProfile && (
            <NavLink
              to="/create-profile"
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 bg-[#244D3C] text-white text-[11px] font-medium uppercase tracking-wider transition-colors hover:bg-[#19382C]"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Create Twin</span>
            </NavLink>
          )}
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-[#20211F]/40 px-3 mb-2 block">
            Wardrobe Engine
          </span>
          {links.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-[#244D3C] text-white'
                      : 'text-[#20211F]/70 hover:bg-[#EBE8E1] hover:text-[#20211F]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 stroke-[1.6]" />
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black/10 tabular-nums">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Silhouette summary footer */}
      {hasProfile && profile && (
        <div className="p-3 border-t border-[#E7E5DF] text-[11px] text-[#20211F]/60">
          <div className="flex items-center gap-1.5 text-[#244D3C] font-semibold mb-1">
            <Ruler className="w-3 h-3" />
            <span>Calibrated Metrics</span>
          </div>
          <span>
            {profile.measurements.height}cm · {profile.measurements.chest}-{profile.measurements.waist}-{profile.measurements.hip}
          </span>
        </div>
      )}
    </aside>
  );
};
