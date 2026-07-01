type PageLoadingSpinnerProps = {
  label?: string;
  className?: string;
};

export default function PageLoadingSpinner({
  label = 'Duke ngarkuar...',
  className = 'min-h-[50vh]',
}: PageLoadingSpinnerProps) {
  return (
    <div
      className={`flex w-full items-center justify-center bg-white ${className}`}
      aria-busy="true"
      aria-label={label}
      role="status"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />
    </div>
  );
}
