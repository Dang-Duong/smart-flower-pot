import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryTable } from "@/components/history/history-table";
import { HistoryCalendar } from "@/components/history/history-calendar";
import { AreaChartCard } from "@/components/charts/area-chart-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { PageHeading } from "@/components/page-heading";
import { getDevicesServer, getReadingsServer } from "@/lib/api-server";
import { aggregateByDayOfWeek, aggregateByHour, toHistoryRows } from "@/lib/aggregations";

export default async function HistoryPage() {
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

  const readings = await getReadingsServer(devices[0].deviceId);

  const historyRows = toHistoryRows(readings, 48);
  const tempDay = aggregateByHour(readings, "airTemp");
  const lightHourly = aggregateByHour(readings, "light");
  const humidityWeek = aggregateByDayOfWeek(readings, "soilMoisture");
  const activeDates = [...new Set(readings.map((r) => r.createdAt.slice(0, 10)))];

  return (
    <>
      <PageHeading title="History" subtitle="Past sensor readings" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:items-start">
        {/* Left column: compact table + calendar */}
        <div className="flex flex-col gap-4">
          <Card className="bg-card text-card-foreground rounded-2xl overflow-hidden">
            <CardHeader className="py-3 px-5 border-b border-gray-200">
              <CardTitle className="text-sm font-bold">Readings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-72 overflow-y-auto">
                <HistoryTable rows={historyRows} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground rounded-2xl">
            <CardHeader className="py-3 px-5 border-b border-gray-200">
              <CardTitle className="text-sm font-bold">Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-4">
              <HistoryCalendar activeDates={activeDates} />
            </CardContent>
          </Card>
        </div>

        {/* Right column: charts */}
        <div className="flex flex-col gap-4">
          <BarChartCard title="Light · today" data={lightHourly} unit=" lx" />
          <AreaChartCard
            title="Temperature graph"
            data={tempDay}
            defaultRange="day"
            unit="°C"
            showRangeDropdown={false}
          />
          <AreaChartCard
            title="Humidity graph"
            data={humidityWeek}
            defaultRange="weekly"
            unit="%"
            showRangeDropdown={false}
          />
        </div>
      </div>
    </>
  );
}
