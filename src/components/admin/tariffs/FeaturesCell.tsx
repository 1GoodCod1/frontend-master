interface FeaturesCellProps {
  features: string[] | undefined;
}

export default function FeaturesCell({ features }: FeaturesCellProps) {
  const featuresArray = Array.isArray(features) ? features : [];

  if (featuresArray.length === 0) {
    return <span className="text-sm text-muted-foreground">No features</span>;
  }

  return (
    <div className="w-full py-0.5">
      {featuresArray.map((feature: string, idx: number) => (
        <div
          key={idx}
          className="border-b border-border py-0.5 text-sm last:border-0"
        >
          • {feature}
        </div>
      ))}
    </div>
  );
}
