import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TemperatureCardProps {
  value: number;
  unit: string;
}

function ThermometerIcon() {
  return (
    <svg
      viewBox="0 0 80 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-20 h-32"
      aria-label="Thermometer"
    >
      <line x1="26" y1="30" x2="32" y2="30" stroke="#E8603C" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="45" x2="32" y2="45" stroke="#E8603C" strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="60" x2="32" y2="60" stroke="#E8603C" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="75" x2="32" y2="75" stroke="#E8603C" strokeWidth="2" strokeLinecap="round" />
      <rect x="33" y="15" width="14" height="82" rx="7" fill="#ADD8F7" stroke="#88BAD8" strokeWidth="1.5" />
      <rect x="36" y="55" width="8" height="42" rx="4" fill="#E8603C" />
      <circle cx="40" cy="105" r="16" fill="#E8603C" />
      <circle cx="40" cy="105" r="10" fill="#FF6B4A" />
    </svg>
  );
}

export function TemperatureCard({ value, unit }: TemperatureCardProps) {
  return (
    <Card className="bg-card text-card-foreground rounded-2xl h-full">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-base font-black">Temperature</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-3 pb-6">
        <ThermometerIcon />
        <p className="font-black text-card-foreground leading-none">
          <span className="text-4xl">{value}</span>
          <span className="text-xl ml-1">{unit}</span>
        </p>
        <p className="text-xs text-card-foreground/50 font-medium">Indoor sensor · live</p>
      </CardContent>
    </Card>
  );
}
