import Link from "next/link";
import { Card } from "@/components/card";

type DashboardCardProps = {
  title: string;
  description: string;
  href: string;
};

export function DashboardCard({ title, description, href }: DashboardCardProps) {
  return (
    <Link href={href}>
      <Card className="block p-5 hover:border-blue-200 hover:shadow-md">
        <h3 className="mb-2 text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </Card>
    </Link>
  );
}
