'use client';

interface StatsCardProps {
  title: string;
  value: number;
  total: number;
  color: 'red' | 'orange' | 'green' | 'blue';
  icon: string;
}

const colorConfig = {
  red: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-600',
    bar: 'bg-red-500',
    light: 'bg-red-100 dark:bg-red-900',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-600',
    bar: 'bg-orange-500',
    light: 'bg-orange-100 dark:bg-orange-900',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-600',
    bar: 'bg-green-500',
    light: 'bg-green-100 dark:bg-green-900',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600',
    bar: 'bg-blue-500',
    light: 'bg-blue-100 dark:bg-blue-900',
  },
};

export default function StatsCard({
  title,
  value,
  total,
  color,
  icon,
}: StatsCardProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const config = colorConfig[color];

  return (
    <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {title}
          </p>
        </div>
        <span className={`text-2xl font-bold ${config.text}`}>
          {value}
        </span>
      </div>

      {/* Progress Bar */}
      <div className={`w-full h-2 rounded-full ${config.light}`}>
        <div
          className={`h-2 rounded-full transition-all duration-500 ${config.bar}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className={`text-xs mt-1 font-medium ${config.text}`}>
        {percentage}% of total patients
      </p>
    </div>
  );
}