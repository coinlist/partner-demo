'use client';

type OfferMilestone = {
  name: string;
  schedule: string;
  status: 'completed' | 'active' | 'upcoming';
};

export function OfferMilestones({
  milestones,
}: {
  milestones: OfferMilestone[];
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Milestones
      </h2>
      <ul className="mt-5 space-y-5">
        {milestones.map((milestone, index) => (
          <li
            key={`${milestone.name}-${milestone.schedule}`}
            className="flex items-start gap-4"
          >
            <StatusDot
              status={milestone.status}
              isLast={index === milestones.length - 1}
            />
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {milestone.name}
              </p>
              <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                {milestone.schedule}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatusDot({
  status,
  isLast,
}: {
  status: OfferMilestone['status'];
  isLast: boolean;
}) {
  const isCompleted = status === 'completed';
  const dotClass = isCompleted
    ? 'border-emerald-400 bg-emerald-400'
    : 'border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100';
  const lineClass = isCompleted
    ? 'bg-emerald-400/70'
    : 'bg-zinc-900/80 dark:bg-zinc-100/80';

  return (
    <span className="relative mt-0.5 flex w-5 justify-center self-stretch">
      {!isLast ? (
        <span
          className={`absolute left-1/2 top-3.5 h-[calc(100%+1.25rem)] w-px -translate-x-1/2 ${lineClass}`}
        />
      ) : null}
      <span
        className={`relative z-10 h-3.5 w-3.5 rounded-full border shadow-[0_0_0_3px] shadow-white dark:shadow-zinc-900 ${dotClass}`}
      />
    </span>
  );
}
