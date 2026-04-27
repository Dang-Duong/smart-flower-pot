import { NotificationEmpty } from "@/components/notification-empty";
import { PageHeading } from "@/components/page-heading";

export default function NotificationsPage() {
  return (
    <>
      <PageHeading title="Notifications" subtitle="Alerts and plant updates" />
      <div className="max-w-6xl mx-auto">
        <NotificationEmpty />
      </div>
    </>
  );
}
