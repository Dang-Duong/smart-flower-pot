import { FlowerCard } from "@/components/flower-card";
import { MetricCard } from "@/components/metric-card";
import { AreaChartCard } from "@/components/charts/area-chart-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { PageHeading } from "@/components/page-heading";
import {
  currentMetrics,
  flower,
  humidityWeek,
  lightHourly,
} from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <>
      <PageHeading title="Dashboard" subtitle="Live plant overview" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* My Flower */}
      <FlowerCard flower={flower} />

      {/* Humidity graph */}
      <AreaChartCard
        title="Humidity graph"
        data={humidityWeek}
        highlightT="Thu"
        defaultRange="weekly"
        unit="%"
      />

      {/* Current metrics */}
      <div className="grid grid-cols-1 divide-y divide-gray-400 sm:grid-cols-3 sm:divide-y-0 sm:divide-x bg-card rounded-2xl overflow-hidden">
        <MetricCard
          label="Humidity"
          value={currentMetrics.humidity.value}
          unit={currentMetrics.humidity.unit}
          status={currentMetrics.humidity.status}
        />
        <MetricCard
          label="Temperature"
          value={currentMetrics.temperature.value}
          unit={currentMetrics.temperature.unit}
          status={currentMetrics.temperature.status}
        />
        <MetricCard
          label="Light"
          value={currentMetrics.light.value}
          unit={currentMetrics.light.unit}
          status={currentMetrics.light.status}
        />
      </div>

      {/* Light graph */}
      <BarChartCard title="Light graph" data={lightHourly} unit=" lx" />
    </div>
    </>
  );
}
