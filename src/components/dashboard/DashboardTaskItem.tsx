export interface DashboardTaskItemProps {
  id: string;
  title: string;
  dueDate: string;
  eventName: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  onToggle: (id: string) => void;
}

export default function DashboardTaskItem({
  id,
  title,
  dueDate,
  eventName,
  priority,
  completed,
  onToggle
}: DashboardTaskItemProps) {
  const priorityBadge =
    priority === "High"
      ? "bg-error-container text-on-error-container font-semibold"
      : priority === "Medium"
      ? "bg-secondary-container text-on-secondary-container font-medium"
      : "bg-surface-container text-on-surface-variant";

  return (
    <div className="py-3 flex items-start justify-between gap-space-md group">
      <div className="flex items-start gap-3 min-w-0">
        <label className="relative flex items-center justify-center mt-0.5 cursor-pointer">
          <input
            className="peer sr-only"
            type="checkbox"
            checked={completed}
            onChange={() => onToggle(id)}
          />
          <div
            className={`w-4 h-4 rounded transition-colors flex items-center justify-center ${
              completed ? "bg-primary text-on-primary" : "bg-surface-container hover:bg-surface-variant"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[12px] ${
                completed ? "opacity-100" : "opacity-0"
              }`}
            >
              check
            </span>
          </div>
        </label>

        <div className="flex flex-col min-w-0">
          <span
            className={`font-body-md-medium text-body-md-medium transition-colors truncate ${
              completed
                ? "text-on-surface-variant line-through opacity-70"
                : "text-on-surface group-hover:text-primary font-medium"
            }`}
          >
            {title}
          </span>
          <div className="flex flex-wrap items-center gap-2 mt-0.5 font-caption text-caption text-on-surface-variant">
            <span className={priority === "High" ? "text-error font-medium" : ""}>
              Due: {dueDate}
            </span>
            <span>•</span>
            <span className="truncate">{eventName}</span>
          </div>
        </div>
      </div>

      <span className={`px-2 py-0.5 rounded-full font-caption text-caption shrink-0 ${priorityBadge}`}>
        {priority === "High" ? "High Priority" : priority === "Medium" ? "Medium Priority" : "Normal"}
      </span>
    </div>
  );
}
