import './Skeleton.css';

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-cover" />
    <div className="skeleton skeleton-title" />
    <div className="skeleton skeleton-line" />
    <div className="skeleton skeleton-line short" />
  </div>
);

export const SkeletonGrid = ({ count = 6 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonGrid;
