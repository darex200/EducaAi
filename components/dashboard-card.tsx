import Link from "next/link";

type DashboardCardProps = {
  title: string;
  description: string;
  href: string;
};

export function DashboardCard({ title, description, href }: DashboardCardProps) {
  return (
    <Link href={href} className="card-surface block p-5 hover:-translate-y-0.5 hover:shadow-md">
      <h3 className="mb-2 text-base font-semibold text-indigo-800">{title}</h3>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </Link>
  );
}
