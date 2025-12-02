interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

const LoadingSpinner = ({ size = 50, color }: LoadingSpinnerProps) => {
  return (
    <svg 
      className="spinner" 
      width={size} 
      height={size} 
      viewBox="0 0 50 50"
      style={{ width: size, height: size }}
    >
      <circle
        className="path"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="4"
        style={{ stroke: color }}
      ></circle>
    </svg>
  );
};

export default LoadingSpinner;