"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";

interface FlowerImageProps {
  src: string;
  alt: string;
  deviceId: string;
}

export function FlowerImage({ src, alt, deviceId }: FlowerImageProps) {
  const storageKey = `flower-image-${deviceId}`;
  const [imageSrc, setImageSrc] = useState(src);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setImageSrc(saved);
  }, [storageKey]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageSrc(dataUrl);
      localStorage.setItem(storageKey, dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div
      className="relative flex-shrink-0 group cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      <img
        src={imageSrc}
        alt={alt}
        className="rounded-full object-cover w-16 h-16 sm:w-24 sm:h-24 ring-2 ring-[#F5A623]"
      />
      <div className="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Camera className="w-5 h-5 text-white" />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
