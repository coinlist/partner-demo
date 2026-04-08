"use client";

type OfferMilestone = {
  name: string;
  schedule: string;
  status: "completed" | "active" | "upcoming";
};

export function OfferMilestones({
  milestones,
}: {
  milestones: OfferMilestone[];
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <h2 className="text-xl font-semibold text-zinc-100">Milestones</h2>
      <ul className="mt-4 space-y-4">
        {milestones.map((milestone) => (
          <li key={`${milestone.name}-${milestone.schedule}`} className="flex gap-3">
            <StatusDot status={milestone.status} />
            <div>
              <p className="text-sm font-medium text-zinc-100">{milestone.name}</p>
              <p className="text-sm text-zinc-400">{milestone.schedule}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StatusDot({ status }: { status: OfferMilestone["status"] }) {
  const bgClass =
    status === "completed"
      ? "bg-emerald-400"
      : status === "active"
        ? "bg-sky-400"
        : "bg-zinc-500";

  return <span className={`mt-1 h-3 w-3 rounded-full ${bgClass}`} />;
}
