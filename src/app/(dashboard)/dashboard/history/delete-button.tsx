"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Check } from "lucide-react";

export function DeleteHistoryButton({ type, id }: { type: string; id: string }) {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/history/${type}/${id}`, { method: "DELETE" });
        if (res.ok) {
          setDeleted(true);
          // Brief visual confirmation then remove from DOM
          setTimeout(() => {
            // Use router refresh for smoother UX instead of full reload
            const el = document.getElementById(`history-${id}`);
            if (el) {
              el.style.transition = "opacity 0.3s, max-height 0.3s";
              el.style.opacity = "0";
              el.style.maxHeight = "0";
              el.style.overflow = "hidden";
              el.style.padding = "0";
              el.style.margin = "0";
              el.style.border = "none";
              setTimeout(() => el.remove(), 300);
            }
          }, 500);
        }
      } catch {
        setShowConfirm(false);
        alert("Failed to delete. Please try again.");
      }
    });
  }

  if (deleted) {
    return (
      <span className="text-xs text-green-600 flex items-center gap-1" id={`history-${id}`}>
        <Check className="h-3 w-3" /> Deleted
      </span>
    );
  }

  if (!showConfirm) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowConfirm(true)}
        aria-label="Delete this item"
        id={`history-${id}`}
      >
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1" id={`history-${id}`}>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs h-7"
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowConfirm(false)}
        disabled={isPending}
        className="text-xs h-7"
      >
        Cancel
      </Button>
    </div>
  );
}
