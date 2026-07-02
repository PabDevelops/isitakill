export default function GlowOrb({
  size = 500,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <div
      className={`glow-orb ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
