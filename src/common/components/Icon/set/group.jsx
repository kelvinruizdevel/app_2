const group = ({
  width, height, style, fill,
}) => (
  <svg
    style={style}
    width={width || '20px'}
    height={height || '19px'}
    viewBox="0 0 39 39"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="19.5" cy="19.5" r="19.5" fill={fill || '#FFB718'} />
    <path d="M10.9886 19.1138C12.7105 19.1138 14.1063 17.7179 14.1063 15.996C14.1063 14.2742 12.7105 12.8783 10.9886 12.8783C9.26671 12.8783 7.87085 14.2742 7.87085 15.996C7.87085 17.7179 9.26671 19.1138 10.9886 19.1138Z" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.9588 24.102H6C6 21.3459 8.2323 19.1136 10.9884 19.1136C12.647 19.1136 14.1061 19.9118 15.0165 21.1589" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28.4473 19.1137C30.1692 19.1137 31.5651 17.7179 31.5651 15.996C31.5651 14.2741 30.1692 12.8782 28.4473 12.8782C26.7254 12.8782 25.3296 14.2741 25.3296 15.996C25.3296 17.7179 26.7254 19.1137 28.4473 19.1137Z" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24.4194 21.1588C25.3298 19.9242 26.7889 19.1136 28.4476 19.1136C31.2036 19.1136 33.4359 21.3459 33.4359 24.1019H26.4771" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24.2208 14.9111C24.2208 17.4053 22.2005 19.4131 19.7188 19.4131C17.2246 19.4131 15.2168 17.3928 15.2168 14.9111C15.2168 12.4294 17.2371 10.4091 19.7188 10.4091C22.2005 10.4091 24.2208 12.4169 24.2208 14.9111Z" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M26.9272 26.6213H12.5107C12.5107 22.643 15.7283 19.4131 19.719 19.4131C23.6972 19.4131 26.9272 22.643 26.9272 26.6213Z" stroke="white" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default group;
