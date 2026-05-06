import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryTable } from "@/components/history/history-table";
import { HistoryCalendar } from "@/components/history/history-calendar";
import { AreaChartCard } from "@/components/charts/area-chart-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { PageHeading } from "@/components/page-heading";
import { DeviceSwitcher } from "@/components/device-switcher";
import { getDevicesServer, getReadingsServer } from "@/lib/api-server";
import { aggregateByDayOfWeek, aggregateByHour, toHistoryRows } from "@/lib/aggregations";

function parseDate(raw: string | undefined): Date | undefined {
  if (!raw) return undefined;
  const d = new Date(`${raw}T00:00:00`);
  return isNaN(d.getTime()) ? undefined : d;
}

function formatSelectedLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; device?: string }>;
}) {
  const { date: dateParam, device: deviceParamId } = await searchParams;
  const selectedDate = parseDate(dateParam);

  const devices = await getDevicesServer();

  if (devices.length === 0) {
    return (
      <>
        <PageHeading title="History" subtitle="Past sensor readings" />
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-white/60">
          <p className="text-base">No device linked yet.</p>
          <a href="/devices" className="text-sm underline text-white/80">Add a device →</a>
        </div>
      </>
    );
  }

  const selectedDevice = devices.find((d) => d.deviceId === deviceParamId) ?? devices[0];
  const readings = await getReadingsServer(selectedDevice.deviceId);

  const historyRows = toHistoryRows(readings, 48, selectedDate);
  const tempDay = aggregateByHour(readings, "airTemp", { date: selectedDate });
  const lightHourly = aggregateByHour(readings, "light", { date: selectedDate });
  const humidityChart = selectedDate
    ? aggregateByHour(readings, "soilMoisture", { date: selectedDate })
    : aggregateByDayOfWeek(readings, "soilMoisture");

  const activeDates = [...new Set(readings.map((r) => r.createdAt.slice(0, 10)))];

  const subtitle = selectedDate
    ? `Showing ${formatSelectedLabel(selectedDate)}`
    : "Past sensor readings";

  const lightTitle = selectedDate ? `Light · ${formatSelectedLabel(selectedDate)}` : "Light · today";

  return (
    <>
      <PageHeading title="History" subtitle={subtitle} />
      {devices.length > 1 && (
        <div className="mb-4 max-w-xs">
          <DeviceSwitcher devices={devices} selectedId={selectedDevice.deviceId} basePath="/history" />
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:items-start">
        <div className="flex flex-col gap-4">
          <Card className="bg-card text-card-foreground rounded-2xl overflow-hidden">
            <CardHeader className="py-3 px-5 border-b border-gray-200">
              <CardTitle className="text-sm font-bold">Readings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div key={dateParam ?? "today"} className="h-72 overflow-y-auto">
                <HistoryTable rows={historyRows} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground rounded-2xl">
            <CardHeader className="py-3 px-5 border-b border-gray-200">
              <CardTitle className="text-sm font-bold">Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-4">
              <HistoryCalendar activeDates={activeDates} selected={selectedDate} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <BarChartCard title={lightTitle} data={lightHourly} unit=" lx" />
          <AreaChartCard
            title="Temperature graph"
            data={tempDay}
            defaultRange="day"
            unit="°C"
            showRangeDropdown={false}
          />
          <AreaChartCard
            title={selectedDate ? "Humidity · hourly" : "Humidity graph"}
            data={humidityChart}
            defaultRange={selectedDate ? "day" : "weekly"}
            unit="%"
            showRangeDropdown={false}
          />
        </div>
      </div>
    </>
  );
}
