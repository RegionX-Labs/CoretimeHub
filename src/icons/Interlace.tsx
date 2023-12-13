type IconProps = {
  color: string;
};
export const InterlaceIcon = ({ color }: IconProps) => {
  return (
    <svg
      width='20'
      height='20'
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M0 11.25C0 6.694 3.694 3 8.25 3C8.664 3 9 3.336 9 3.75V10.5H15.75C16.164 10.5 16.5 10.836 16.5 11.25C16.5 15.806 12.806 19.5 8.25 19.5C3.694 19.5 0 15.806 0 11.25Z'
        fill={color}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M10.5 0.749999C10.5 0.335999 10.836 -9.53674e-07 11.25 -9.53674e-07C15.806 -9.53674e-07 19.5 3.694 19.5 8.25C19.5 8.664 19.164 9 18.75 9H11.25C10.836 9 10.5 8.664 10.5 8.25V0.749999Z'
        fill={color}
      />
    </svg>
  );
};
