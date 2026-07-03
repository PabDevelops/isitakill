export default function DotGrid({
  className = '',
  variant = 'section',
}: {
  className?: string
  variant?: 'section' | 'page'
}) {
  const base = variant === 'page' ? 'dot-grid-page' : 'dot-grid'
  return <div className={`${base} ${className}`} />
}
