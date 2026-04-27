import { FlowerCard } from "@/components/flower-card";
import { TemperatureCard } from "@/components/temperature-card";
import { AreaChartCard } from "@/components/charts/area-chart-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { PageHeading } from "@/components/page-heading";
import {
  currentMetrics,
  flower,
  humidityWeek,
  lightHourly,
  tempDay,
} from "@/lib/mock-data";

export default function DetailPage() {
  return (
    <>
      <PageHeading title="Detail" subtitle="Sensor readings in depth" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Row 1 */}
        <FlowerCard flower={flower} />
        <TemperatureCard
          value={currentMetrics.temperature.value}
          unit={currentMetrics.temperature.unit}
        />
        <AreaChartCard
          title="Temperature graph"
          data={tempDay}
          highlightT="14:00"
          defaultRange="day"
          unit="°C"
        />

        {/* Row 2 */}
        <div className="lg:col-span-1">
          <BarChartCard title="Light graph" data={lightHourly} unit=" lx" />
        </div>
        <div className="lg:col-span-2">
          <AreaChartCard
            title="Humidity graph"
            data={humidityWeek}
            highlightT="Thu"
            defaultRange="weekly"
            unit="%"
          />
        </div>
      </div>
    </>
  );
}
