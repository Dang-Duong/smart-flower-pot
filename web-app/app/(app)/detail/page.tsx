import { FlowerCard } from "@/components/flower-card";
import { TemperatureCard } from "@/components/temperature-card";
import { AreaChartCard } from "@/components/charts/area-chart-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { PageHeading } from "@/components/page-heading";
import { flower } from "@/lib/mock-data";
import { getDevicesServer, getReadingsServer } from "@/lib/api-server";
import { latestMetric, aggregateByDayOfWeek, aggregateByHour, aggregateByDayOfMonth } from "@/lib/aggregations";

type Range = "day" | "weekly" | "monthly";

function resolveRange(raw: string | undefined, fallback: Range): Range {
  if (raw === "day" || raw === "weekly" || raw === "monthly") return raw;
  return fallback;
}

export default async function DetailPage({
  searchParams,
}: {
  searchParams: Promise<{ device?: string; tempRange?: string; humidityRange?: string }>;
}) {
  const { device: deviceParamId, tempRange: tempRangeRaw, humidityRange: humidityRangeRaw } = await searchParams;
  const tempRange = resolveRange(tempRangeRaw, "day");
  const humidityRange = resolveRange(humidityRangeRaw, "weekly");

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
  const humidityMetric = latestMetric(readings, "soilMoisture", "%");
  const lightHourly = aggregateByHour(readings, "light");

  const tempChart =
    tempRange === "monthly"
      ? aggregateByDayOfMonth(readings, "airTemp")
      : tempRange === "weekly"
        ? aggregateByDayOfWeek(readings, "airTemp")
        : aggregateByHour(readings, "airTemp");

  const humidityChart =
    humidityRange === "day"
      ? aggregateByHour(readings, "soilMoisture")
      : humidityRange === "monthly"
        ? aggregateByDayOfMonth(readings, "soilMoisture")
        : aggregateByDayOfWeek(readings, "soilMoisture");

  return (
    <>
      <PageHeading title="Detail" subtitle="Sensor readings in depth" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FlowerCard
          flower={flower}
          devices={devices}
          selectedDevice={selectedDevice}
          status={humidityMetric.status}
        />
        <TemperatureCard value={temperatureMetric.value} unit={temperatureMetric.unit} />
        <AreaChartCard
          title="Temperature graph"
          data={tempChart}
          defaultRange="day"
          rangeParamKey="tempRange"
          unit="°C"
        />

        <div className="lg:col-span-1">
          <BarChartCard title="Light graph" data={lightHourly} unit=" lx" />
        </div>
        <div className="lg:col-span-2">
          <AreaChartCard
            title="Humidity graph"
            data={humidityChart}
            defaultRange="weekly"
            rangeParamKey="humidityRange"
            unit="%"
          />
        </div>
      </div>
    </>
  );
}
