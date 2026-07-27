const HijabIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.1"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* hijab hood + body, one silhouette */}
    <path d="M7 13.5C5.8 11 6 6.5 12 1.6c6 4.9 6.2 9.4 5 11.9l1.8 7.7H5.2Z" />
    {/* face */}
    <ellipse cx="12" cy="8" rx="2.4" ry="3.1" />
    {/* neckline */}
    <path d="M9.3 13.5c.8 2.5 1.8 4.2 2.7 6 .9-1.8 1.9-3.5 2.7-6" />
  </svg>
);

export default HijabIcon;
