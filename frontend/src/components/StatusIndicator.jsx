export default function StatusIndicator({
  online,
  label,
}) {
  return (
    <span className="status-indicator">
      <span
        className={`status-dot ${
          online ? "online" : "offline"
        }`}
      />
      {label}
    </span>
  );
}