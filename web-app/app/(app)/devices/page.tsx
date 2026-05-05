import { getToken } from "@/lib/auth-server";
import { PageHeading } from "@/components/page-heading";
import { DeviceList } from "@/components/devices/device-list";
import { AddDeviceForm } from "@/components/devices/add-device-form";
import type { Device } from "@/lib/api";

async function fetchDevices(token: string): Promise<Device[]> {
  const res = await fetch(`${process.env.API_BASE_URL}/api/users/devices`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.devices ?? [];
}

export default async function DevicesPage() {
  const token = await getToken();
  const devices = token ? await fetchDevices(token) : [];

  return (
    <>
      <PageHeading title="Devices" subtitle="Manage your Smart Flower Pot devices." />
      <div className="max-w-xl flex flex-col gap-6">
        <AddDeviceForm />
        <div>
          <h2 className="text-sm font-medium text-white/60 mb-3 uppercase tracking-wider">Your devices</h2>
          <DeviceList devices={devices} />
        </div>
      </div>
    </>
  );
}
