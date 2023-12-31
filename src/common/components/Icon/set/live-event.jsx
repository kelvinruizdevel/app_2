const liveEvent = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '44'}
    height={height || '45'}
    viewBox="0 0 44 45"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="22" cy="22.5" r="22" fill={color || '#EB3323'} />
    <path fillRule="evenodd" clipRule="evenodd" d="M11 13.5C10.4477 13.5 10 13.9477 10 14.5V31.5C10 32.0523 10.4477 32.5 11 32.5H28C28.5523 32.5 29 32.0523 29 31.5V26.4641L32.75 28.6292C33.4167 29.0141 34.25 28.5329 34.25 27.7631V18.2369C34.25 17.4671 33.4167 16.9859 32.75 17.3708L29 19.5359V14.5C29 13.9477 28.5523 13.5 28 13.5H11Z" fill="white" />
    <path d="M24.5 22.134C25.1667 22.5189 25.1667 23.4811 24.5 23.866L17.75 27.7631C17.0833 28.148 16.25 27.6669 16.25 26.8971L16.25 19.1029C16.25 18.3331 17.0833 17.852 17.75 18.2369L24.5 22.134Z" fill={color || '#EB3323'} />
  </svg>
);

export default liveEvent;
