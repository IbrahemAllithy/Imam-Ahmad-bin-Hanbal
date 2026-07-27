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
    <ellipse cx="12" cy="8" rx="2.5" ry="3" />
    {/* neckline notch */}
    <path d="M10.3 13.9c.7 1 1.2 1.8 1.7 3 .5-1.2 1-2 1.7-3" />
  </svg>
);

export default HijabIcon;
