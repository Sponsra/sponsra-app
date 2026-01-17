"use client";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = "pi pi-inbox",
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <i className={icon}></i>}
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="modern-button"
          style={{ marginTop: "1rem" }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
