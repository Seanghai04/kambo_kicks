import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type AdminSectionCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  highlights?: string[];
  primaryHref?: string;
  primaryLabel?: string;
};

export default function AdminSectionCard({
  title,
  description,
  icon: Icon,
  highlights = [],
  primaryHref = '/admin',
  primaryLabel = 'Back to dashboard',
}: AdminSectionCardProps) {
  return (
    <div className="kk-rise border border-[var(--kk-line)] bg-white">
      <div className="relative overflow-hidden border-b border-[var(--kk-line)] bg-[var(--kk-ink)] px-6 py-7 text-white sm:px-8">
        <span className="absolute -right-4 top-0 h-full w-16 -skew-x-12 bg-[var(--kk-kick)]/85" />
        <div className="relative flex items-start gap-4">
          <span className="flex h-11 w-11 items-center justify-center bg-white/10">
            <Icon className="h-5 w-5" strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--kk-kick)]">
              Kambo module
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
              {title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{description}</p>
          </div>
        </div>
      </div>

      {highlights.length > 0 && (
        <ul className="grid gap-0 sm:grid-cols-3">
          {highlights.map((item, index) => (
            <li
              key={item}
              className={`border-[var(--kk-line)] px-5 py-4 text-sm text-[var(--kk-slate)] sm:px-6 ${
                index < highlights.length - 1 ? 'border-b sm:border-b-0 sm:border-r' : ''
              }`}
            >
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--kk-mute)]">
                Focus {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-[var(--kk-line)] px-6 py-5 sm:px-8">
        <Link href={primaryHref} className="kk-admin-btn">
          {primaryLabel}
        </Link>
      </div>
    </div>
  );
}
