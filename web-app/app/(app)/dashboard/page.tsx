import { FlowerCard } from "@/components/flower-card";
import { MetricCard } from "@/components/metric-card";
import { AreaChartCard } from "@/components/charts/area-chart-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { PageHeading } from "@/components/page-heading";
import { flower } from "@/lib/mock-data";
import { getDevicesServer, getReadingsServer } from "@/lib/api-server";
import { latestMetric, aggregateByDayOfWeek, aggregateByHour } from "@/lib/aggregations";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ device?: string }>;
}) {
  const { device: deviceParamId } = await searchParams;
  const devices = await getDevicesServer();

  if (devices.length === 0) {
    return (
      <>
        <PageHeading title="Dashboard" subtitle="Live plant overview" />
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/60">
          <p className="text-base">No device linked yet.</p>
          <a href="/devices" className="text-sm underline text-white/80">Add a device →</a>
        </div>
      </>
    );
  }

  const selectedDevice = devices.find((d) => d.deviceId === deviceParamId) ?? devices[0];
  const readings = await getReadingsServer(selectedDevice.deviceId);

  const humidityMetric = latestMetric(readings, "soilMoisture", "%");
  const temperatureMetric = latestMetric(readings, "airTemp", "°C");
  const lightMetric = latestMetric(readings, "light", "lx");
  const humidityWeek = aggregateByDayOfWeek(readings, "soilMoisture");
  const lightHourly = aggregateByHour(readings, "light");

  return (
    <>
      <PageHeading title="Dashboard" subtitle="Live plant overview" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FlowerCard flower={flower} devices={devices} selectedDevice={selectedDevice} />

        <AreaChartCard
          title="Humidity graph"
          data={humidityWeek}
          defaultRange="weekly"
          unit="%"
        />

        <div className="grid grid-cols-1 divide-y divide-gray-400 sm:grid-cols-3 sm:divide-y-0 sm:divide-x bg-card rounded-2xl overflow-hidden">
          <MetricCard
            label="Humidity"
            value={humidityMetric.value}
            unit={humidityMetric.unit}
            status={humidityMetric.status}
          />
          <MetricCard
            label="Temperature"
            value={temperatureMetric.value}
            unit={temperatureMetric.unit}
            status={temperatureMetric.status}
          />
          <MetricCard
            label="Light"
            value={lightMetric.value}
            unit={lightMetric.unit}
            status={lightMetric.status}
          />
        </div>

        <BarChartCard title="Light graph" data={lightHourly} unit=" lx" />
      </div>
    </>
  );
}
