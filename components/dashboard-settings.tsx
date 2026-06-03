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

type VerificationRequest = {
  id: string;
  platform: string;
  handle: string;
  followerCount: number | null;
  proofType: string;
  proofUrl: string;
  code: string;
  requestedFeeBps: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNotes: string | null;
  createdAt: string;
  decidedAt: string | null;
};

export function DashboardSettings() {
  const { publicKey } = useWallet();
  const [data, setData] = useState<SettingsPayload | null>(null);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [apply, setApply] = useState({
    platform: "X",
    handle: "",
    followerCount: "",
    proofType: "tweet" as "tweet" | "bio",
    proofUrl: "",
    code: "",
  });

  const load = useCallback(async () => {
    if (!publicKey) {
      setData(null);
      setRequests([]);
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

      const reqRes = await fetch(
        `/api/v1/creators/verification?wallet=${encodeURIComponent(publicKey.toBase58())}`,
      );
      const reqJson = (await reqRes.json()) as { items?: VerificationRequest[]; error?: string };
      if (reqRes.ok) {
        setRequests(reqJson.items ?? []);
      } else {
        setRequests([]);
      }
    } catch (e) {
      setData(null);
      setRequests([]);
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

  useEffect(() => {
    if (!publicKey) return;
    if (apply.code) return;
    const bytes = new Uint8Array(10);
    crypto.getRandomValues(bytes);
    const code = `nodeblink-${Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 10)}`;
    setApply((a) => ({ ...a, code }));
  }, [publicKey, apply.code]);

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

  const submitVerification = async () => {
    if (!publicKey || !data?.onboarded) return;
    const handle = apply.handle.trim();
    const proofUrl = apply.proofUrl.trim();
    if (!handle) {
      setMessage({ type: "err", text: "Enter your social handle." });
      return;
    }
    if (!proofUrl) {
      setMessage({ type: "err", text: "Paste a proof link." });
      return;
    }
    setRequesting(true);
    setMessage(null);
    try {
      const followerCount = apply.followerCount.trim()
        ? Number(apply.followerCount.trim())
        : undefined;
      if (followerCount !== undefined && (!Number.isFinite(followerCount) || followerCount < 0)) {
        throw new Error("Follower count must be a valid number.");
      }

      const response = await fetch("/api/v1/creators/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          platform: apply.platform,
          handle,
          followerCount,
          proofType: apply.proofType,
          proofUrl,
          code: apply.code,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: unknown };
      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "Request failed");
      }
      setMessage({ type: "ok", text: "Verification request submitted." });
      await load();
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Request failed" });
    } finally {
      setRequesting(false);
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
                placeholder="https://... (png/jpg recommended)"
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

          <section className="card stack" style={{ padding: 22 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Verified creator</h2>
            <p className="muted" style={{ margin: 0, lineHeight: 1.7 }}>
              Apply for a verified badge and a discounted 1.5% protocol fee.
            </p>

            {requests[0] ? (
              <div className="panel stack" style={{ padding: 18 }}>
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                  Latest request: {requests[0].status.toLowerCase()} · {requests[0].platform} · {requests[0].handle}
                </p>
                {requests[0].adminNotes ? (
                  <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                    Notes: {requests[0].adminNotes}
                  </p>
                ) : null}
              </div>
            ) : null}

            <label className="field">
              <span>Platform</span>
              <select
                className="input"
                value={apply.platform}
                onChange={(e) => setApply((a) => ({ ...a, platform: e.target.value }))}
              >
                <option value="X">X</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="TikTok">TikTok</option>
              </select>
            </label>

            <label className="field">
              <span>Handle</span>
              <input
                className="input"
                placeholder="@yourhandle"
                value={apply.handle}
                onChange={(e) => setApply((a) => ({ ...a, handle: e.target.value }))}
              />
            </label>

            <label className="field">
              <span>Follower count (optional)</span>
              <input
                className="input"
                type="number"
                min="0"
                step="1"
                value={apply.followerCount}
                onChange={(e) => setApply((a) => ({ ...a, followerCount: e.target.value }))}
              />
            </label>

            <label className="field">
              <span>Proof method</span>
              <select
                className="input"
                value={apply.proofType}
                onChange={(e) => setApply((a) => ({ ...a, proofType: e.target.value as "tweet" | "bio" }))}
              >
                <option value="tweet">Post a tweet with the code</option>
                <option value="bio">Put the code in your bio</option>
              </select>
            </label>

            <div className="panel stack" style={{ padding: 18 }}>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                Verification code:
              </p>
              <code style={{ wordBreak: "break-all" }}>{apply.code}</code>
              <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
                Add this code to your post or bio, then paste the link below.
              </p>
            </div>

            <label className="field">
              <span>Proof link</span>
              <input
                className="input"
                placeholder="https://..."
                value={apply.proofUrl}
                onChange={(e) => setApply((a) => ({ ...a, proofUrl: e.target.value }))}
              />
            </label>

            <button type="button" className="btn btn-primary" disabled={requesting} onClick={submitVerification}>
              {requesting ? <Loader2 size={16} className="animate-spin" /> : "Submit request"}
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}
