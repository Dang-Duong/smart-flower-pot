import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  DaisyFlower,
  DahliaFlower,
  MarigoldFlower,
  SakuraFlower,
  VioletFlower,
} from "./flowers";

export function WelcomeHero() {
  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* top-left daisy — slow sway */}
      <div
        className="absolute top-4 left-6 hidden sm:block"
        style={{ animation: "flower-sway 3.2s ease-in-out infinite" }}
      >
        <DaisyFlower className="w-40 h-40 opacity-90" />
      </div>

      {/* top-center marigold — bouncy pop */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 hidden sm:block"
        style={{ animation: "flower-pop 2.4s ease-in-out infinite" }}
      >
        <MarigoldFlower className="w-52 h-52 opacity-90" />
      </div>

      {/* top-right violet — bob, offset start */}
      <div
        className="absolute top-4 right-8 hidden sm:block"
        style={{ animation: "flower-bob 2.8s ease-in-out infinite 0.6s" }}
      >
        <VioletFlower className="w-36 h-36 opacity-90" />
      </div>

      {/* bottom-left dahlia — rotated 90° so it lies sideways, stem into left wall */}
      <div className="absolute left-0 bottom-[32%] hidden sm:block" style={{ transform: "rotate(90deg)" }}>
        <div style={{ animation: "flower-sway 3.6s ease-in-out infinite 1.1s" }}>
          <DahliaFlower className="w-44 h-44 opacity-90" />
        </div>
      </div>

      {/* bottom-right sakura — rotated -90° so it lies sideways, stem into right wall */}
      <div className="absolute right-0 bottom-[32%] hidden sm:block" style={{ transform: "rotate(-90deg)" }}>
        <div style={{ animation: "flower-sway 3s ease-in-out infinite 0.4s" }}>
          <SakuraFlower className="w-40 h-40 opacity-90" />
        </div>
      </div>

      {/* hero text */}
      <div className="relative z-10 text-center flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-tight tracking-tight">
            Welcome to<br />Smart Flower Pot
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-md">
            Watch your plants thrive — humidity, light, temperature, all in one place.
          </p>
        </div>
        <Button
          asChild
          className="bg-[#F5A623] hover:bg-[#e8941a] text-black font-bold px-10 py-6 rounded-full text-lg"
        >
          <Link href="/signup">
            Get started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <p className="text-sm text-zinc-400 mt-1">
          Already have an account?{" "}
          <Link href="/login" className="text-[#F5A623] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
