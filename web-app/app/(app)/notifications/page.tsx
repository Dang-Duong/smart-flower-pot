import { NotificationEmpty } from "@/components/notification-empty";
import { NotificationList } from "@/components/notification-list";
import { PageHeading } from "@/components/page-heading";
import { getDevicesServer, getReadingsServer } from "@/lib/api-server";
import { deriveNotifications } from "@/lib/notifications";
import type { SensorReading } from "@/lib/types";

export default async function NotificationsPage() {
  const devices = await getDevicesServer();

  const readingsByDevice: Record<string, SensorReading[]> = {};
  await Promise.all(
    devices.map(async (d) => {
      readingsByDevice[d.deviceId] = await getReadingsServer(d.deviceId);
    }),
  );

  const notifications = deriveNotifications(devices, readingsByDevice);

  return (
    <>
      <PageHeading title="Notifications" subtitle="Alerts and plant updates" />
      <div className="max-w-6xl mx-auto">
        {notifications.length === 0 ? (
          <NotificationEmpty />
        ) : (
          <NotificationList items={notifications} />
        )}
      </div>
    </>
  );
}
