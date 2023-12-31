const smile = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '24px'}
    height={height || '24px'}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path stroke={color || '#25BF6C'} d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path stroke={color || '#25BF6C'} d="M19.174 13.4355C19.174 16.9173 15.9601 20.1312 12.0001 20.1312C8.04009 20.1312 4.82617 16.9173 4.82617 13.4355H19.174Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path stroke={color || '#25BF6C'} d="M5.78223 10.0869C5.78223 9.5795 5.98378 9.09291 6.34254 8.73415C6.70131 8.37538 7.1879 8.17383 7.69527 8.17383C8.20264 8.17383 8.68923 8.37538 9.048 8.73415C9.40676 9.09291 9.60831 9.5795 9.60831 10.0869" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path stroke={color || '#25BF6C'} d="M18.2177 10.0869C18.2177 9.5795 18.0161 9.09291 17.6574 8.73415C17.2986 8.37538 16.812 8.17383 16.3046 8.17383C15.7973 8.17383 15.3107 8.37538 14.9519 8.73415C14.5932 9.09291 14.3916 9.5795 14.3916 10.0869" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default smile;
