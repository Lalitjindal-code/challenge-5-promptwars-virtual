interface DashboardStatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: string;
  iconBg?: string;
  iconColor?: string;
  progress?: number;
  progressColor?: string;
  rightLabel?: string;
}

export default function DashboardStatCard({
  label,
  value,
  subtext,
  icon,
  iconBg = "bg-surface-container",
  iconColor = "text-primary",
  progress,
  progressColor = "bg-primary",
  rightLabel
}: DashboardStatCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow border border-outline-variant/15">
      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}`}>
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
      </div>

      <div className="mt-space-md">
        <div className="font-headline-xl text-headline-xl text-primary leading-none tracking-tight">
          {value}
        </div>
        {subtext && (
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 truncate">
            {subtext}
          </p>
        )}
        {progress !== undefined && (
          <div className="mt-2">
            {rightLabel && (
              <div className="flex items-center justify-between mt-1 mb-1 font-caption text-caption">
                <span className="text-on-surface-variant">{subtext}</span>
                <span className="font-label-sm text-label-sm text-primary">{rightLabel}</span>
              </div>
            )}
            <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className={`h-full ${progressColor} rounded-full transition-all`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
