const SectionTitle = ({ title, subtitle }) => (
  <div className="section-header">
    <h2 className="section-title">{title}</h2>
    {subtitle && <p className="section-subtitle">{subtitle}</p>}
  </div>
);

export default SectionTitle;
