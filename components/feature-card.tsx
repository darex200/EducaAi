type FeatureCardProps = {
  title: string;
  description: string;
};

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <article className="card-surface p-5 hover:-translate-y-0.5 hover:shadow-md">
      <h3 className="mb-2 text-lg font-semibold text-indigo-800">{title}</h3>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
