import { CATEGORIES } from '../../utils/helpers';
import './CategoryFilter.css';

const CategoryFilter = ({ active, onChange }) => (
  <div className="category-filter">
    {CATEGORIES.map((cat) => (
      <button
        key={cat}
        type="button"
        className={`pill ${active === cat ? 'pill-active' : ''}`}
        onClick={() => onChange(cat)}
      >
        {cat}
      </button>
    ))}
  </div>
);

export default CategoryFilter;
