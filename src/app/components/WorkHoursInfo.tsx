import { MdAccessTime } from 'react-icons/md';
import { WORK_DAYS, WORK_HOURS, WORK_HOURS_LABEL } from '@/app/lib/contact';

type WorkHoursInfoProps = {
  theme?: 'light' | 'dark';
  className?: string;
};

export default function WorkHoursInfo({ theme = 'light', className = '' }: WorkHoursInfoProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`flex gap-4 ${className}`}>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
          isDark ? 'bg-white/10 text-white' : 'bg-[#0a9945]/10 text-[#0a9945]'
        }`}
      >
        <MdAccessTime size={22} />
      </div>
      <div className="min-w-0">
        <p
          className={`text-[11px] font-semibold uppercase tracking-wider ${
            isDark ? 'text-gray-400' : 'text-neutral-400'
          }`}
        >
          {WORK_HOURS_LABEL}
        </p>
        <p
          className={`mt-1 text-base font-semibold leading-snug ${
            isDark ? 'text-white' : 'text-neutral-900'
          }`}
        >
          {WORK_DAYS}
        </p>
        <p
          className={`mt-1 flex items-center gap-1.5 text-sm ${
            isDark ? 'text-gray-300' : 'text-neutral-500'
          }`}
        >
          <MdAccessTime
            size={14}
            className={isDark ? 'shrink-0 text-[#0a9945]' : 'shrink-0 text-[#0a9945]'}
            aria-hidden
          />
          <span>{WORK_HOURS}</span>
        </p>
      </div>
    </div>
  );
}
