import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryTable } from "@/components/history/history-table";
import { HistoryCalendar } from "@/components/history/history-calendar";
import { AreaChartCard } from "@/components/charts/area-chart-card";
import { BarChartCard } from "@/components/charts/bar-chart-card";
import { PageHeading } from "@/components/page-heading";
import { historyRows, humidityWeek, lightHourly, tempDay } from "@/lib/mock-data";

export default function HistoryPage() {
  return (
    <>
      <PageHeading title="History" subtitle="Past sensor readings" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
        {/* Left column: history table + calendar + bar chart */}
        <Card className="bg-card text-card-foreground rounded-2xl">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-base font-black">History</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex flex-col gap-4">
            <div className="flex gap-4 flex-col md:flex-row">
              <div className="flex-1 overflow-x-auto">
                <HistoryTable rows={historyRows} />
              </div>
              <div className="flex-shrink-0">
                <HistoryCalendar />
              </div>
            </div>
            <BarChartCard title="Light · today" data={lightHourly} unit=" lx" />
          </CardContent>
        </Card>

        {/* Right column: temperature + humidity graphs */}
        <div className="flex flex-col gap-6">
          <AreaChartCard
            title="Temperature graph"
            data={tempDay}
            highlightT="14:00"
            defaultRange="day"
            unit="°C"
            showRangeDropdown={false}
          />
          <AreaChartCard
            title="Humidity graph"
            data={humidityWeek}
            highlightT="Thu"
            defaultRange="weekly"
            unit="%"
            showRangeDropdown={false}
          />
        </div>
      </div>
    </>
  );
}
