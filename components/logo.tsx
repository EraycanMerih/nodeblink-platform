export function Logo({ size = 48, className }: { size?: number, className?: string }) {
  return (
    <img
      src="/logo.png"
      width={size}
      alt="NodeBlink Logo"
      className={className}
      style={{ display: "inline-block", flexShrink: 0, height: "auto", objectFit: "contain", maxHeight: size }}
    />
  );
}
