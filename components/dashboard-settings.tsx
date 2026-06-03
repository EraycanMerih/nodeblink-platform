"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2, Save } from "lucide-react";

type SettingsPayload = {
  onboarded: boolean;
  username?: string;
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
};

export function DashboardSettings() {
  const { publicKey } = useWallet();
  const [data, setData] = useState<SettingsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPreview, setUploadingPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!publicKey) {
      setData(null);
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/v1/dashboard?wallet=${encodeURIComponent(publicKey.toBase58())}`,
      );
      const payload = (await response.json()) as SettingsPayload & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Settings unavailable");
      setData(payload);
    } catch (e) {
      setData(null);
      setMessage({
        type: "err",
        text: e instanceof Error ? e.message : "Settings unavailable",
      });
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async () => {
    if (!publicKey || !data?.onboarded) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/v1/creators/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          bio: data.bio,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: unknown };
      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Save failed");
      }
      setMessage({ type: "ok", text: "Settings saved." });
      await load();
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const uploadPreview = async () => {
    if (!publicKey || !data?.onboarded || !previewFile) return;
    setUploadingPreview(true);
    setMessage(null);
    try {
      if (!previewFile.type.startsWith("image/")) {
        throw new Error("Choose an image file (png/jpg/webp).");
      }
      if (previewFile.size > 6 * 1024 * 1024) {
        throw new Error("Image must be under 6 MB.");
      }

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result ?? "");
          const comma = result.indexOf(",");
          resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = () => reject(new Error("Could not read file."));
        reader.readAsDataURL(previewFile);
      });

      const response = await fetch("/api/v1/creators/preview-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          filename: previewFile.name,
          base64Data,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; url?: string; error?: unknown };
      if (!response.ok || !payload.url) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Upload failed");
      }
      setData((d) => (d ? { ...d, coverUrl: payload.url ?? d.coverUrl } : d));
      setPreviewFile(null);
      setMessage({ type: "ok", text: "Preview image uploaded." });
      await load();
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setUploadingPreview(false);
    }
  };

  const uploadAvatar = async () => {
    if (!publicKey || !data?.onboarded || !avatarFile) return;
    setUploadingAvatar(true);
    setMessage(null);
    try {
      if (!avatarFile.type.startsWith("image/")) {
        throw new Error("Choose an image file (png/jpg/webp).");
      }
      if (avatarFile.size > 4 * 1024 * 1024) {
        throw new Error("Image must be under 4 MB.");
      }

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result ?? "");
          const comma = result.indexOf(",");
          resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = () => reject(new Error("Could not read file."));
        reader.readAsDataURL(avatarFile);
      });

      const response = await fetch("/api/v1/creators/avatar-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          filename: avatarFile.name,
          base64Data,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; url?: string; error?: unknown };
      if (!response.ok || !payload.url) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Upload failed");
      }
      setData((d) => (d ? { ...d, avatarUrl: payload.url ?? d.avatarUrl } : d));
      setAvatarFile(null);
      setMessage({ type: "ok", text: "Avatar uploaded." });
      await load();
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="stack">
      <div className="stack" style={{ gap: 10 }}>
        <span className="badge">Settings</span>
        <h1 className="display" style={{ margin: 0, fontSize: "clamp(1.7rem, 3vw, 2.3rem)" }}>
          Creator profile settings
        </h1>
        <p className="muted" style={{ margin: 0, maxWidth: 720, lineHeight: 1.7 }}>
          Update your bio, avatar, and preview image.
        </p>
      </div>

      {message ? (
        <p className={message.type === "ok" ? "notice notice-ok" : "notice notice-err"} role="status">
          {message.text}
        </p>
      ) : null}

      {!publicKey ? (
        <div className="panel" style={{ padding: 28 }}>
          <p className="muted" style={{ margin: 0 }}>
            Connect a wallet to manage settings.
          </p>
        </div>
      ) : loading ? (
        <div className="panel" style={{ padding: 28, display: "flex", gap: 10, alignItems: "center" }}>
          <Loader2 className="animate-spin" size={18} /> Loading…
        </div>
      ) : !data?.onboarded ? (
        <div className="panel stack" style={{ padding: 28 }}>
          <h2 style={{ margin: 0 }}>Finish onboarding first</h2>
          <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
            Create a creator profile in Studio to unlock settings.
          </p>
        </div>
      ) : data ? (
        <section className="panel stack" style={{ padding: 24, maxWidth: 720 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Public profile</h2>

          <label className="field">
            <span>Display name</span>
            <input className="input" value={data.displayName ?? ""} disabled />
          </label>

          <label className="field">
            <span>Bio</span>
            <textarea
              className="input"
              rows={3}
              value={data.bio ?? ""}
              onChange={(e) => setData((d) => (d ? { ...d, bio: e.target.value } : d))}
            />
          </label>

          <label className="field">
            <span>Upload avatar</span>
            <input
              className="input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={uploadingAvatar || !avatarFile}
            onClick={uploadAvatar}
          >
            {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : "Upload avatar"}
          </button>

          <label className="field">
            <span>Upload preview image</span>
            <input
              className="input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setPreviewFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <button
            type="button"
            className="btn btn-secondary"
            disabled={uploadingPreview || !previewFile}
            onClick={uploadPreview}
          >
            {uploadingPreview ? <Loader2 size={16} className="animate-spin" /> : "Upload preview image"}
          </button>

          <button type="button" className="btn btn-primary" disabled={saving} onClick={update}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save changes
          </button>
        </section>
      ) : null}
    </div>
  );
}
