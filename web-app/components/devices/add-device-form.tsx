"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Copy, Check } from "lucide-react";

import { addDevice, ApiError, type Device } from "@/lib/api";
import { addDeviceSchema, type AddDeviceValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AddDeviceForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [newDevice, setNewDevice] = useState<Device | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<AddDeviceValues>({
    resolver: zodResolver(addDeviceSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: AddDeviceValues) {
    setServerError(null);
    setNewDevice(null);
    try {
      const res = await addDevice(values.name);
      const added = res.devices.at(-1) ?? null;
      setNewDevice(added);
      form.reset();
      router.refresh();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  async function copyToken() {
    if (!newDevice) return;
    await navigator.clipboard.writeText(newDevice.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-white/10 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white">Add device</CardTitle>
          <CardDescription>Give your pot a name to pair it with this account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3 items-end">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-white/80">Device name</FormLabel>
                    <FormControl>
                      <Input placeholder="Living room pot" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="bg-[#F5A623] hover:bg-[#e8941a] text-black font-bold shrink-0"
              >
                {form.formState.isSubmitting ? "Adding…" : "Add"}
              </Button>
            </form>
          </Form>

          {serverError && (
            <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</p>
          )}
        </CardContent>
      </Card>

      {newDevice && (
        <Card className="border-[#F5A623]/30 bg-zinc-900">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-white mb-1">
              Device <span className="text-[#F5A623]">{newDevice.name}</span> added
            </p>
            <p className="text-xs text-white/50 mb-3">
              Copy the token below and flash it to your hardware. It won&apos;t be shown again.
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-black/50 border border-white/10 px-3 py-2">
              <code className="flex-1 text-xs text-green-400 break-all font-mono">{newDevice.token}</code>
              <Button size="icon-sm" variant="ghost" onClick={copyToken} className="shrink-0 text-white/60 hover:text-white">
                {copied ? <Check className="size-3.5 text-green-400" /> : <Copy className="size-3.5" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
