export default function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6">
      <p className="text-sm text-neutral-500">{title}</p>
      <h3 className="mt-2 text-2xl font-semibold">{value}</h3>
    </div>
  );
}
