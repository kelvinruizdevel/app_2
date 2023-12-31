const regularFace = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '24'}
    height={height || '24'}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23Z" stroke={color || '#F9A000'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.78259 10.0869C5.78259 9.5795 5.98414 9.09291 6.34291 8.73415C6.70168 8.37538 7.18827 8.17383 7.69564 8.17383C8.20301 8.17383 8.6896 8.37538 9.04836 8.73415C9.40713 9.09291 9.60868 9.5795 9.60868 10.0869" stroke={color || '#F9A000'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 16C16 16.2652 15.5786 16.5196 14.8284 16.7071C14.0783 16.8946 13.0609 17 12 17C10.9391 17 9.92172 16.8946 9.17157 16.7071C8.42143 16.5196 8 16.2652 8 16" stroke={color || '#F9A000'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.2174 10.0869C18.2174 9.5795 18.0158 9.09291 17.6571 8.73415C17.2983 8.37538 16.8117 8.17383 16.3043 8.17383C15.797 8.17383 15.3104 8.37538 14.9516 8.73415C14.5928 9.09291 14.3913 9.5795 14.3913 10.0869" stroke={color || '#F9A000'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>

);

export default regularFace;
