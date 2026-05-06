"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FlowerDetailsProps {
  deviceId: string;
  defaultName: string;
  defaultSpecies: string;
}

function storageKey(deviceId: string) {
  return `flower-details-${deviceId}`;
}

export function FlowerDetails({ deviceId, defaultName, defaultSpecies }: FlowerDetailsProps) {
  const [name, setName] = useState(defaultName);
  const [species, setSpecies] = useState(defaultSpecies);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey(deviceId));
    if (saved) {
      const parsed = JSON.parse(saved) as { name: string; species: string };
      setName(parsed.name);
      setSpecies(parsed.species);
    } else {
      setName(defaultName);
      setSpecies(defaultSpecies);
    }
  }, [deviceId, defaultName, defaultSpecies]);

  function handleBlur(field: "name" | "species", value: string) {
    const updated = { name, species, [field]: value };
    localStorage.setItem(storageKey(deviceId), JSON.stringify(updated));
  }

  return (
    <>
      <div>
        <Label className="text-sm font-black text-card-foreground mb-1 block">Flower name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={(e) => handleBlur("name", e.target.value)}
          className="bg-white border-gray-300 text-black rounded-lg"
        />
      </div>
      <div>
        <Label className="text-sm font-black text-card-foreground mb-1 block">Species</Label>
        <Input
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          onBlur={(e) => handleBlur("species", e.target.value)}
          className="bg-white border-gray-300 text-black rounded-lg"
        />
      </div>
    </>
  );
}
