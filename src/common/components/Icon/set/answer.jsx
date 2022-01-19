import { useColorModeValue } from '@chakra-ui/react';

const answer = ({
  width, height, style, color,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width || '24'}
    height={height || '24'}
    style={style}
    viewBox="0 0 24 24"
  >
    <path
      fill={useColorModeValue((color || '#0097CF'), '#FFFFFF')}
      d="M10 13h-4v-1h4v1zm2.318-4.288l3.301 3.299-4.369.989 1.068-4.288zm11.682-5.062l-7.268 7.353-3.401-3.402 7.267-7.352 3.402 3.401zm-6 8.916v.977c0 4.107-6 2.457-6 2.457s1.518 6-2.638 6h-7.362v-20h14.056l1.977-2h-18.033v24h10.189c3.163 0 9.811-7.223 9.811-9.614v-3.843l-2 2.023z"
    />
  </svg>
);

export default answer;
