"use client";

import { useState } from "react";
import { RefreshCw, Copy, Check } from "lucide-react";

import { regenerateDeviceToken, ApiError, type Device, type RegenerateResponse } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function DeviceCard({ device }: { device: Device }) {
  const [regenerated, setRegenerated] = useState<RegenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleRegenerate() {
    setLoading(true);
    try {
      const res = await regenerateDeviceToken(device.deviceId);
      setRegenerated(res);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed to regenerate token");
    } finally {
      setLoading(false);
    }
  }

  async function copyToken(token: string) {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="bg-card">
      <CardContent className="pt-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium text-card-foreground">{device.name}</p>
            <p className="text-xs text-card-foreground/50 font-mono mt-0.5">{device.deviceId}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={loading}
            onClick={handleRegenerate}
            className="shrink-0"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} />
            {loading ? "Regenerating…" : "Regenerate token"}
          </Button>
        </div>

        {regenerated && (
          <div>
            <p className="text-xs text-card-foreground/60 mb-1.5">New token — copy and reflash your hardware:</p>
            <div className="flex items-center gap-2 rounded-lg bg-black/10 border border-card-foreground/20 px-3 py-2">
              <code className="flex-1 text-xs text-green-700 break-all font-mono">{regenerated.token}</code>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => copyToken(regenerated.token)}
                className="shrink-0 text-card-foreground/60 hover:text-card-foreground"
              >
                {copied ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DeviceList({ devices }: { devices: Device[] }) {
  if (devices.length === 0) {
    return (
      <p className="text-sm text-white/40 py-4">No devices yet. Add your first pot above.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {devices.map((d) => (
        <DeviceCard key={d.deviceId} device={d} />
      ))}
    </div>
  );
}
