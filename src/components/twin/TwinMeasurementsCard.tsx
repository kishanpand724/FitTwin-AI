import React from 'react';
import { Ruler, Edit3, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BodyMeasurements, UnitSystem } from '../../types';

interface TwinMeasurementsCardProps {
  measurements: BodyMeasurements;
  units: UnitSystem;
  onEditHref?: string;
}

export const TwinMeasurementsCard: React.FC<TwinMeasurementsCardProps> = ({
  measurements,
  units,
  onEditHref = '/create-profile',
}) => {
  // Conversion helper
  const isMetric = units === 'metric';
  const formatLength = (cm: number) => {
    if (isMetric) return `${cm} cm`;
    const inches = Math.round(cm / 2.54);
    return `${inches} in`;
  };

  const formatWeight = (kg?: number) => {
    if (!kg) return 'Not set';
    if (isMetric) return `${kg} kg`;
    return `${Math.round(kg * 2.20462)} lbs`;
  };

  // Body silhouette calculation
  const chestToWaist = measurements.chest / (measurements.waist || 1);
  const hipToWaist = measurements.hip / (measurements.waist || 1);
  
  let silhouetteShape = 'Balanced Rectangle';
  let silhouetteDescription = 'Proportional shoulder and hip alignment with natural waist definition.';

  if (chestToWaist > 1.25 && hipToWaist < 1.15) {
    silhouetteShape = 'Athletic V-Taper';
    silhouetteDescription = 'Pronounced shoulder breadth tapering into a lean waistline.';
  } else if (hipToWaist > 1.25 && chestToWaist > 1.2) {
    silhouetteShape = 'Balanced Hourglass';
    silhouetteDescription = 'Harmonious upper torso and hip curves with structured waist indentation.';
  } else if (hipToWaist > 1.28) {
    silhouetteShape = 'Pear Silhouette';
    silhouetteDescription = 'Gentle upper torso widening gracefully toward hip and thigh anchors.';
  }

  return (
    <div className="bg-white border border-[#E7E5DF] p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E7E5DF]">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-[#244D3C]" />
            <h3 className="text-sm font-semibold tracking-wider uppercase text-[#20211F]">
              Measurement Profile
            </h3>
          </div>
          <Link
            to={onEditHref}
            className="flex items-center gap-1.5 text-xs text-[#244D3C] hover:text-[#19382C] font-medium tracking-wide uppercase"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Metrics</span>
          </Link>
        </div>

        {/* Silhouette Classification */}
        <div className="p-3.5 bg-[#F8F7F4] border border-[#E7E5DF] mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#244D3C]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#244D3C]">
              {silhouetteShape}
            </span>
          </div>
          <p className="text-xs text-[#20211F]/70 leading-relaxed">
            {silhouetteDescription}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 border border-[#E7E5DF]">
            <span className="text-[11px] uppercase tracking-wider text-[#20211F]/60 block mb-1">
              Height
            </span>
            <span className="text-base font-semibold text-[#20211F] tabular-nums">
              {formatLength(measurements.height)}
            </span>
          </div>

          <div className="p-3 border border-[#E7E5DF]">
            <span className="text-[11px] uppercase tracking-wider text-[#20211F]/60 block mb-1">
              Shoulder Width
            </span>
            <span className="text-base font-semibold text-[#20211F] tabular-nums">
              {formatLength(measurements.shoulderWidth)}
            </span>
          </div>

          <div className="p-3 border border-[#E7E5DF]">
            <span className="text-[11px] uppercase tracking-wider text-[#20211F]/60 block mb-1">
              Chest
            </span>
            <span className="text-base font-semibold text-[#20211F] tabular-nums">
              {formatLength(measurements.chest)}
            </span>
          </div>

          <div className="p-3 border border-[#E7E5DF]">
            <span className="text-[11px] uppercase tracking-wider text-[#20211F]/60 block mb-1">
              Waist
            </span>
            <span className="text-base font-semibold text-[#20211F] tabular-nums">
              {formatLength(measurements.waist)}
            </span>
          </div>

          <div className="p-3 border border-[#E7E5DF]">
            <span className="text-[11px] uppercase tracking-wider text-[#20211F]/60 block mb-1">
              Hips
            </span>
            <span className="text-base font-semibold text-[#20211F] tabular-nums">
              {formatLength(measurements.hip)}
            </span>
          </div>

          <div className="p-3 border border-[#E7E5DF]">
            <span className="text-[11px] uppercase tracking-wider text-[#20211F]/60 block mb-1">
              Inseam
            </span>
            <span className="text-base font-semibold text-[#20211F] tabular-nums">
              {formatLength(measurements.inseam)}
            </span>
          </div>

          <div className="p-3 border border-[#E7E5DF]">
            <span className="text-[11px] uppercase tracking-wider text-[#20211F]/60 block mb-1">
              Arm Length
            </span>
            <span className="text-base font-semibold text-[#20211F] tabular-nums">
              {formatLength(measurements.armLength)}
            </span>
          </div>

          <div className="p-3 border border-[#E7E5DF]">
            <span className="text-[11px] uppercase tracking-wider text-[#20211F]/60 block mb-1">
              Weight
            </span>
            <span className="text-base font-semibold text-[#20211F] tabular-nums">
              {formatWeight(measurements.weight)}
            </span>
          </div>
        </div>
      </div>

      {/* Accuracy & Calibration status */}
      <div className="pt-3 border-t border-[#E7E5DF] text-[11px] text-[#20211F]/60 flex items-center justify-between">
        <span>Units: {isMetric ? 'Metric (cm / kg)' : 'Imperial (in / lbs)'}</span>
        <span className="text-[#244D3C] font-medium">Calibrated ✓</span>
      </div>
    </div>
  );
};
