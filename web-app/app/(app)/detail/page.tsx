import { FlowerCard } from "@/components/flower-card";
import { TemperatureCard } from "@/components/temperature-card";
import { AreaChartCard } from "@/components/charts/area-chart-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { PageHeading } from "@/components/page-heading";
import { flower } from "@/lib/mock-data";
import { getDevicesServer, getReadingsServer } from "@/lib/api-server";
import { latestMetric, aggregateByDayOfWeek, aggregateByHour } from "@/lib/aggregations";

export default async function DetailPage({
  searchParams,
}: {
  searchParams: Promise<{ device?: string }>;
}) {
  const { device: deviceParamId } = await searchParams;
  const devices = await getDevicesServer();

  if (devices.length === 0) {
    return (
      <>
        <PageHeading title="Detail" subtitle="Sensor readings in depth" />
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/60">
          <p className="text-base">No device linked yet.</p>
          <a href="/devices" className="text-sm underline text-white/80">Add a device →</a>
        </div>
      </>
    );
  }

  const selectedDevice = devices.find((d) => d.deviceId === deviceParamId) ?? devices[0];
  const readings = await getReadingsServer(selectedDevice.deviceId);

  const temperatureMetric = latestMetric(readings, "airTemp", "°C");
  const tempDay = aggregateByHour(readings, "airTemp");
  const lightHourly = aggregateByHour(readings, "light");
  const humidityWeek = aggregateByDayOfWeek(readings, "soilMoisture");

  return (
    <>
      <PageHeading title="Detail" subtitle="Sensor readings in depth" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FlowerCard flower={flower} devices={devices} selectedDevice={selectedDevice} />
        <TemperatureCard value={temperatureMetric.value} unit={temperatureMetric.unit} />
        <AreaChartCard
          title="Temperature graph"
          data={tempDay}
          defaultRange="day"
          unit="°C"
        />

        <div className="lg:col-span-1">
          <BarChartCard title="Light graph" data={lightHourly} unit=" lx" />
        </div>
        <div className="lg:col-span-2">
          <AreaChartCard
            title="Humidity graph"
            data={humidityWeek}
            defaultRange="weekly"
            unit="%"
          />
        </div>
      </div>
    </>
  );
}
