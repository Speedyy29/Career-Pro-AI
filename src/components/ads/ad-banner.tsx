"use client";

import { cn } from "@/lib/utils";

interface AdBannerProps {
  slot: "header" | "sidebar" | "in-content" | "footer";
  className?: string;
}

const slotConfig = {
  header: { width: "728px", height: "90px", label: "728x90 Leaderboard" },
  sidebar: { width: "160px", height: "600px", label: "160x600 Skyscraper" },
  "in-content": { width: "728px", height: "90px", label: "728x90 In-content" },
  footer: { width: "728px", height: "90px", label: "728x90 Footer" },
};

export function AdBanner({ slot, className }: AdBannerProps) {
  const config = slotConfig[slot];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-muted/30 border border-dashed border-muted-foreground/20 my-4",
        className
      )}
      style={{ maxWidth: config.width, minHeight: config.height === "600px" ? "400px" : config.height }}
    >
      {/* Replace this with actual AdSense code when ready */}
      <div className="text-center">
        <p className="text-[10px] text-muted-foreground/50">Advertisement</p>
        <p className="text-[10px] text-muted-foreground/30">{config.label}</p>
      </div>
      {/*
        When AdSense is approved, replace the content above with:
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}
          data-ad-slot="YOUR_SLOT_ID"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      */}
    </div>
  );
}
