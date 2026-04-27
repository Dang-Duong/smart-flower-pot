interface PageHeadingProps {
  title: string;
  subtitle?: string;
}

export function PageHeading({ title, subtitle }: PageHeadingProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-black text-white">{title}</h1>
      {subtitle && <p className="text-sm text-white/60 mt-0.5">{subtitle}</p>}
    </div>
  );
}
