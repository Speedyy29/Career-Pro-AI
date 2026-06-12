"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle } from "lucide-react";

export function DeleteAccountButton() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (confirmText !== "DELETE") return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete account");
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!showConfirm) {
    return (
      <Button variant="destructive" size="sm" onClick={() => setShowConfirm(true)}>
        Delete Account
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Type <strong>DELETE</strong> to confirm account deletion:
      </p>
      <Input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="Type DELETE to confirm"
        className="max-w-xs"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          disabled={confirmText !== "DELETE" || loading}
          onClick={handleDelete}
        >
          {loading ? (
            <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Deleting...</>
          ) : (
            <><AlertTriangle className="mr-2 h-3 w-3" /> Permanently Delete</>
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={() => { setShowConfirm(false); setConfirmText(""); setError(""); }}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
