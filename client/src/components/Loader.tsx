type LoaderProps = {
  label?: string;
  className?: string;
};

const Loader = ({ label = "Loading...", className = "" }: LoaderProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 w-full ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative size-14">
        <div className="absolute inset-0 rounded-full border-[3px] border-red-100" />
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-red-500 border-r-red-400 animate-spin" />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-red-500/35 to-rose-400/15 animate-pulse" />
      </div>
      <span className="text-sm font-medium tracking-wide text-red-500">
        {label}
      </span>
    </div>
  );
};

export default Loader;
