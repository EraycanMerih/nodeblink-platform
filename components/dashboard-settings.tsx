"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2, Save } from "lucide-react";

type SettingsPayload = {
  onboarded: boolean;
  username?: string;
  displayName?: string;
  bio?: string | null;
  websiteUrl?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  discordWebhookUrl?: string | null;
  accessWebhookUrl?: string | null;
};

export function DashboardSettings() {
  const { publicKey } = useWallet();
  const [data, setData] = useState<SettingsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
          websiteUrl: data.websiteUrl,
          avatarUrl: data.avatarUrl,
          coverUrl: data.coverUrl,
          discordWebhookUrl: data.discordWebhookUrl,
          accessWebhookUrl: data.accessWebhookUrl,
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

  return (
    <div className="stack">
      <div className="stack" style={{ gap: 10 }}>
        <span className="badge">Settings</span>
        <h1 className="display" style={{ margin: 0, fontSize: "clamp(1.7rem, 3vw, 2.3rem)" }}>
          Creator profile settings
        </h1>
        <p className="muted" style={{ margin: 0, maxWidth: 720, lineHeight: 1.7 }}>
          Update your public checkout profile and optional webhook integrations.
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
        <div className="grid-2" style={{ alignItems: "start" }}>
          <section className="panel stack" style={{ padding: 24 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Public profile</h2>

            <label className="field">
              <span>Display name</span>
              <input
                className="input"
                value={data.displayName ?? ""}
                disabled
              />
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
              <span>Website URL</span>
              <input
                className="input"
                placeholder="https://"
                value={data.websiteUrl ?? ""}
                onChange={(e) => setData((d) => (d ? { ...d, websiteUrl: e.target.value } : d))}
              />
            </label>

            <label className="field">
              <span>Avatar URL</span>
              <input
                className="input"
                placeholder="/action-icon.svg or https://"
                value={data.avatarUrl ?? ""}
                onChange={(e) => setData((d) => (d ? { ...d, avatarUrl: e.target.value } : d))}
              />
            </label>

            <label className="field">
              <span>Cover URL</span>
              <input
                className="input"
                placeholder="https://"
                value={data.coverUrl ?? ""}
                onChange={(e) => setData((d) => (d ? { ...d, coverUrl: e.target.value } : d))}
              />
            </label>

            <button type="button" className="btn btn-primary" disabled={saving} onClick={update}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save changes
            </button>
          </section>

          <section className="card stack" style={{ padding: 22 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Webhooks</h2>
            <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
              Optional webhooks for delivery and access workflows. Keep these private.
            </p>

            <label className="field">
              <span>Discord webhook URL</span>
              <input
                className="input"
                placeholder="https://discord.com/api/webhooks/..."
                value={data.discordWebhookUrl ?? ""}
                onChange={(e) =>
                  setData((d) => (d ? { ...d, discordWebhookUrl: e.target.value } : d))
                }
              />
            </label>

            <label className="field">
              <span>Access webhook URL</span>
              <input
                className="input"
                placeholder="https://..."
                value={data.accessWebhookUrl ?? ""}
                onChange={(e) =>
                  setData((d) => (d ? { ...d, accessWebhookUrl: e.target.value } : d))
                }
              />
            </label>

            <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
              Your public URL: <code>/creator/{data.username}</code>
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
