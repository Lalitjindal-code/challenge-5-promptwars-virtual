import { Link } from "react-router-dom";
import { useEventContext } from "../../context/EventContext";

export interface DashboardEventCardProps {
  id: string;
  name: string;
  type: string;
  date: string;
  location: string;
  coverImage?: string;
  budget: number;
  spent: number;
  tasksCompleted: number;
  totalTasks: number;
  onSelect?: () => void;
}

const defaultTypeBadgeColors: Record<string, string> = {
  Wedding: "bg-secondary-fixed text-on-secondary-fixed",
  Corporate: "bg-surface-container-high text-on-primary-container",
  Tech: "bg-surface-container-high text-on-primary-container",
  Birthday: "bg-secondary-container text-on-secondary-container",
  Anniversary: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  Community: "bg-surface-container text-on-surface"
};

export default function DashboardEventCard({
  id: _id,
  name,
  type,
  date,
  location,
  coverImage,
  budget,
  spent,
  tasksCompleted,
  totalTasks,
  onSelect
}: DashboardEventCardProps) {
  const { formatCurrency } = useEventContext();
  const budgetPct = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;
  const taskPct = totalTasks > 0 ? Math.min(Math.round((tasksCompleted / totalTasks) * 100), 100) : 0;
  const badgeClass = defaultTypeBadgeColors[type] || "bg-secondary-fixed text-on-secondary-fixed";

  return (
    <article className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row gap-space-md items-start border border-outline-variant/15 group">
      {/* Cover Image */}
      <div className="w-full sm:w-44 h-36 rounded-lg overflow-hidden shrink-0 relative bg-surface-container">
        {coverImage ? (
          <img
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={coverImage}
            alt={name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e8edff'/%3E%3Ctext x='200' y='150' font-family='Arial' font-size='16' text-anchor='middle' fill='%2317233b'%3EPlanora AI Event%3C/text%3E%3C/svg%3E";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-container text-primary">
            <span className="material-symbols-outlined text-[36px] opacity-40">celebration</span>
          </div>
        )}
        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full font-caption text-caption shadow-sm ${badgeClass}`}>
          {type}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0 justify-between w-full h-full py-0.5">
        <div>
          <div className="flex items-start justify-between gap-space-xs">
            <div className="min-w-0">
              <h3 className="font-title-md text-title-md text-primary truncate font-semibold">{name}</h3>
              <div className="flex items-center gap-1 text-on-surface-variant font-caption text-caption mt-0.5">
                <span className="material-symbols-outlined text-[14px]">event</span>
                <span>{date}</span>
              </div>
            </div>
            <Link
              to="/event-details"
              onClick={onSelect}
              className="font-label-md text-label-md text-primary hover:text-secondary flex items-center gap-0.5 transition-colors shrink-0 font-medium"
            >
              <span>View Details</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 text-on-surface-variant font-body-md text-body-md mt-2">
            <span className="material-symbols-outlined text-[16px] text-outline shrink-0">location_on</span>
            <span className="truncate">{location || "Location pending"}</span>
          </div>
        </div>

        {/* Metric Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mt-4 pt-3 bg-surface-container-low/60 p-2.5 rounded-lg border border-outline-variant/10">
          <div>
            <div className="flex items-center justify-between font-caption text-caption mb-1">
              <span className="text-on-surface-variant">
                Budget: {formatCurrency(spent)} / {formatCurrency(budget)}
              </span>
              <span className="font-label-sm text-label-sm text-primary font-semibold">{budgetPct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${budgetPct}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between font-caption text-caption mb-1">
              <span className="text-on-surface-variant">Tasks Completed</span>
              <span className="font-label-sm text-label-sm text-secondary font-semibold">
                {tasksCompleted}/{totalTasks} ({taskPct}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div className="h-full bg-secondary-fixed-dim rounded-full transition-all" style={{ width: `${taskPct}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
