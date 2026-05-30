const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const {
    Connection,
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
    clusterApiUrl
} = require("@solana/web3.js");
const {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createTransferCheckedInstruction
} = require("@solana/spl-token");

const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT) || 8080;
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
const RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta");
const TREASURY_WALLET = process.env.TREASURY_WALLET || "11111111111111111111111111111111";
const DEFAULT_CREATOR_WALLET = process.env.DEFAULT_CREATOR_WALLET || "11111111111111111111111111111111";
const USDC_MINT = process.env.USDC_MINT || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_DECIMALS = Number(process.env.USDC_DECIMALS || 6);
const ASSET_BASE_URL = process.env.ASSET_BASE_URL || PUBLIC_BASE_URL;
const DOWNLOAD_SECRET = process.env.DOWNLOAD_SECRET || crypto.randomBytes(32).toString("hex");
const DATA_DIR = path.join(__dirname, "data");
const DATA_PATH = path.join(DATA_DIR, "store.json");
const ADMIN_SECRET_PATH = path.join(DATA_DIR, "admin-secret.txt");
const UPLOAD_DIR = path.join(__dirname, "uploads");
const DEFAULT_PROTOCOL_FEE_BPS = Number(process.env.PROTOCOL_FEE_BPS || 150);
const ADMIN_SESSION_COOKIE = "nodeblink_admin_session";
const MAX_ASSET_FILE_BYTES = 100 * 1024 * 1024;
const MAX_BANNER_FILE_BYTES = 5 * 1024 * 1024;
const ADMIN_ENTRY_PATH = process.env.ADMIN_ENTRY_PATH || "/operations-9b72f1c4d6e8";
const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_LOGIN_MAX_ATTEMPTS = 5;

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const loadOrCreateAdminSecret = () => {
    if (process.env.ADMIN_SECRET) {
        return String(process.env.ADMIN_SECRET).trim();
    }
    if (fs.existsSync(ADMIN_SECRET_PATH)) {
        return fs.readFileSync(ADMIN_SECRET_PATH, "utf-8").trim();
    }
    const generated = crypto.randomBytes(24).toString("hex");
    fs.writeFileSync(ADMIN_SECRET_PATH, `${generated}\n`, { mode: 0o600 });
    return generated;
};

let ADMIN_SECRET = loadOrCreateAdminSecret();
const adminSessions = new Map();
const adminLoginAttempts = new Map();

const upload = multer({
    dest: UPLOAD_DIR,
    limits: {
        fileSize: MAX_ASSET_FILE_BYTES
    }
});
const connection = new Connection(RPC_URL, "confirmed");
const downloadTokens = new Map();

const deleteUploadedFile = (file) => {
    if (!file?.path) return;
    try {
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
    } catch (error) {
        console.warn(`Unable to remove uploaded file ${file.path}: ${error.message}`);
    }
};

const createEmptyStore = () => ({
    blinks: [],
    walletProfiles: [],
    feeConfig: { protocol_fee_bps: DEFAULT_PROTOCOL_FEE_BPS },
    webhookLogs: [],
    receipts: []
});

const loadStore = () => {
    if (!fs.existsSync(DATA_PATH)) {
        return createEmptyStore();
    }
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    try {
        const parsed = JSON.parse(raw);
        return {
            ...createEmptyStore(),
            ...parsed,
            feeConfig: {
                protocol_fee_bps: Number(parsed?.feeConfig?.protocol_fee_bps ?? DEFAULT_PROTOCOL_FEE_BPS)
            },
            blinks: Array.isArray(parsed?.blinks) ? parsed.blinks : [],
            walletProfiles: Array.isArray(parsed?.walletProfiles) ? parsed.walletProfiles : [],
                webhookLogs: Array.isArray(parsed?.webhookLogs) ? parsed.webhookLogs : [],
                receipts: Array.isArray(parsed?.receipts) ? parsed.receipts : []
        };
    } catch (error) {
        throw new Error(`Failed to parse data store: ${error.message}`);
    }
};

let store = loadStore();

const saveStore = () => {
    fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2));
};

const logWebhookEvent = (entry) => {
    store.webhookLogs.unshift({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...entry
    });
    if (store.webhookLogs.length > 200) {
        store.webhookLogs.pop();
    }
    saveStore();
};

const computeMetrics = () => {
    const revenue = { USDC: 0, SOL: 0 };
    let totalClicks = 0;
    let totalSales = 0;
    const feeRate = store.feeConfig.protocol_fee_bps / 10000;

    store.blinks.forEach((blink) => {
        totalClicks += blink.total_clicks;
        totalSales += blink.total_sales;
        if (blink.currency === "SOL") {
            revenue.SOL += blink.total_sales * blink.price;
        } else {
            revenue.USDC += blink.total_sales * blink.price;
        }
    });

    return {
        revenue,
        total_clicks: totalClicks,
        total_sales: totalSales,
        fees: {
            USDC: revenue.USDC * feeRate,
            SOL: revenue.SOL * feeRate
        }
    };
};

const createBlinkUrl = (id) => `${PUBLIC_BASE_URL}/api/blink/${id}`;

const createSignedDownload = (blinkId, buyerAccount, filePath, fileName) => {
    const token = crypto.randomBytes(20).toString("hex");
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const payload = `${blinkId}:${buyerAccount}:${expiresAt}`;
    const signature = crypto.createHmac("sha256", DOWNLOAD_SECRET).update(payload).digest("hex");
    const url = `${ASSET_BASE_URL}/api/download/${token}?sig=${signature}&exp=${expiresAt}`;
    downloadTokens.set(token, { expires_at: expiresAt, signature, filePath, fileName });
    return { token, url, expires_at: expiresAt };
};

const parsePublicKey = (value, label) => {
    try {
        return new PublicKey(value);
    } catch (error) {
        throw new Error(`Invalid ${label}.`);
    }
};

const parseUrl = (value) => {
    try {
        return new URL(value).toString();
    } catch (error) {
        throw new Error("Invalid URL.");
    }
};

const parseCookies = (headerValue = "") => Object.fromEntries(
    headerValue.split(";").map((item) => item.trim()).filter(Boolean).map((item) => {
        const index = item.indexOf("=");
        if (index === -1) return [item, ""];
        return [item.slice(0, index), decodeURIComponent(item.slice(index + 1))];
    })
);

const createAdminSession = () => {
    const token = crypto.randomBytes(24).toString("hex");
    adminSessions.set(token, Date.now() + 24 * 60 * 60 * 1000);
    return token;
};

const getClientIdentifier = (req) => {
    const forwardedFor = String(req.get("x-forwarded-for") || "").split(",")[0].trim();
    return forwardedFor || req.ip || req.socket?.remoteAddress || "unknown";
};

const getLoginAttemptState = (key) => {
    const now = Date.now();
    const state = adminLoginAttempts.get(key);
    if (!state) {
        return { attempts: 0, lockedUntil: 0, windowStart: now };
    }
    if (state.lockedUntil && state.lockedUntil <= now) {
        adminLoginAttempts.delete(key);
        return { attempts: 0, lockedUntil: 0, windowStart: now };
    }
    if (state.windowStart && now - state.windowStart > ADMIN_LOGIN_WINDOW_MS) {
        adminLoginAttempts.delete(key);
        return { attempts: 0, lockedUntil: 0, windowStart: now };
    }
    return state;
};

const registerLoginFailure = (key) => {
    const now = Date.now();
    const current = getLoginAttemptState(key);
    const next = {
        windowStart: current.attempts ? (current.windowStart || now) : now,
        attempts: current.attempts + 1,
        lockedUntil: 0
    };
    if (next.attempts >= ADMIN_LOGIN_MAX_ATTEMPTS) {
        next.lockedUntil = now + ADMIN_LOGIN_WINDOW_MS;
    }
    adminLoginAttempts.set(key, next);
};

const clearLoginFailures = (key) => {
    adminLoginAttempts.delete(key);
};

const clearExpiredAdminSessions = () => {
    const now = Date.now();
    for (const [token, expiresAt] of adminSessions.entries()) {
        if (expiresAt <= now) {
            adminSessions.delete(token);
        }
    }
};

const isValidAdminSession = (req) => {
    clearExpiredAdminSessions();
    const cookies = parseCookies(req.get("cookie") || "");
    const sessionToken = cookies[ADMIN_SESSION_COOKIE];
    return Boolean(sessionToken && adminSessions.has(sessionToken));
};

const requireAdminSecret = (req, res, next) => {
    if (!ADMIN_SECRET) {
        return res.status(503).json({ error: "Access denied." });
    }
    const provided = req.query.admin_secret || req.get("x-admin-secret") || ((req.get("authorization") || "").replace(/^Bearer\s+/, ""));
    if (provided === ADMIN_SECRET || isValidAdminSession(req)) {
        return next();
    }
    if (provided !== ADMIN_SECRET) {
        return res.status(403).json({ error: "Access denied." });
    }
    return next();
};

const createReceiptRecord = ({ blink, buyerAccount, transactionSignature, delivery, routing }) => {
    const id = crypto.randomUUID();
    const token = crypto.randomBytes(16).toString("hex");
    const receipt = {
        id,
        token,
        created_at: new Date().toISOString(),
        blink_id: blink.id,
        title: blink.title,
        price: blink.price,
        currency: blink.currency,
        category: blink.category,
        buyer_account: buyerAccount,
        transaction_signature: transactionSignature || null,
        delivery: delivery || null,
        routing: routing || null,
        receipt_url: `${PUBLIC_BASE_URL}/receipt/${token}`
    };
    store.receipts.unshift(receipt);
    if (store.receipts.length > 500) {
        store.receipts.pop();
    }
    saveStore();
    return receipt;
};

const escapeHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const corsOrigins = (process.env.CORS_ORIGINS || `${PUBLIC_BASE_URL},https://dial.to`)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .concat(["null"]);

app.use(cors({
    origin: corsOrigins.length ? corsOrigins : undefined,
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-secret"],
    credentials: true
}));
app.disable("x-powered-by");
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    next();
});
app.use(express.json({ limit: "2mb" }));

const sendAdminPage = (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path.join(__dirname, "admin.html"));
};

const sendDashboardPage = (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard.html"));
};

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/dashboard", sendDashboardPage);
app.get("/dashboard.html", sendDashboardPage);

app.get(ADMIN_ENTRY_PATH, sendAdminPage);
app.get("/admin", (req, res) => res.redirect(301, ADMIN_ENTRY_PATH));
app.get("/admin.html", (req, res) => res.redirect(301, ADMIN_ENTRY_PATH));

app.use(express.static(__dirname));
// Do NOT serve the entire uploads directory statically. Asset files (purchased
// downloads) must be delivered only via signed download links. Expose only
// safe banner image assets via a controlled route.
app.get("/uploads/:file", (req, res) => {
    const file = String(req.params.file || "").trim();
    // Prevent path traversal
    const safeName = path.basename(file);
    const ext = path.extname(safeName).toLowerCase();
    const allowedImageExts = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);
    if (!allowedImageExts.has(ext)) {
        return res.status(404).end();
    }
    const filePath = path.join(UPLOAD_DIR, safeName);
    if (!fs.existsSync(filePath)) return res.status(404).end();
    return res.sendFile(filePath);
});

app.get("/api/metrics", (req, res) => {
    // Allow public read-only access to metrics from any origin (used by the
    // static dashboard and other monitoring tools). This endpoint exposes
    // aggregate, non-sensitive data only.
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(computeMetrics());
});

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: ADMIN_LOGIN_MAX_ATTEMPTS, standardHeaders: true, legacyHeaders: false });

app.post("/api/admin/login", loginLimiter, express.json(), (req, res) => {
    if (!ADMIN_SECRET) {
        return res.status(503).json({ error: "Access denied." });
    }
    const clientKey = getClientIdentifier(req);
    const state = getLoginAttemptState(clientKey);
    if (state.lockedUntil && state.lockedUntil > Date.now()) {
        res.setHeader("Retry-After", String(Math.ceil((state.lockedUntil - Date.now()) / 1000)));
        return res.status(429).json({ error: "Too many failed attempts. Please wait and try again." });
    }
    const secret = String(req.body?.secret || "").trim();
    if (secret !== ADMIN_SECRET) {
        registerLoginFailure(clientKey);
        return res.status(403).json({ error: "Access denied." });
    }
    clearLoginFailures(clientKey);
    const sessionToken = createAdminSession();
    const cookieFlags = [`${ADMIN_SESSION_COOKIE}=${encodeURIComponent(sessionToken)}`, "HttpOnly", "Path=/", "SameSite=Lax", `Max-Age=${24 * 60 * 60}`];
    if (String(PUBLIC_BASE_URL).startsWith("https://")) {
        cookieFlags.push("Secure");
    }
    res.setHeader("Set-Cookie", cookieFlags.join("; "));
    res.json({ ok: true });
});

app.post("/api/admin/logout", (req, res) => {
    const cookieFlags = [`${ADMIN_SESSION_COOKIE}=`, "HttpOnly", "Path=/", "SameSite=Lax", "Max-Age=0"];
    if (String(PUBLIC_BASE_URL).startsWith("https://")) {
        cookieFlags.push("Secure");
    }
    res.setHeader("Set-Cookie", cookieFlags.join("; "));
    res.json({ ok: true });
});

app.get("/api/wallet-profiles", requireAdminSecret, (req, res) => {
    res.json(store.walletProfiles);
});

app.post("/api/wallet-profiles", requireAdminSecret, (req, res) => {
    const { label, address, is_default } = req.body;
    if (!label || !address) {
        return res.status(400).json({ error: "Label and address are required." });
    }
    let parsedAddress;
    try {
        parsedAddress = parsePublicKey(address, "wallet address");
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
    const profile = {
        id: crypto.randomUUID(),
        label: String(label).trim(),
        address: parsedAddress.toString(),
        is_default: Boolean(is_default) || store.walletProfiles.length === 0
    };
    if (profile.is_default) {
        store.walletProfiles.forEach((item) => {
            item.is_default = false;
        });
    }
    store.walletProfiles.unshift(profile);
    saveStore();
    res.status(201).json(profile);
});

app.put("/api/wallet-profiles/:id", requireAdminSecret, (req, res) => {
    const profile = store.walletProfiles.find((item) => item.id === req.params.id);
    if (!profile) {
        return res.status(404).json({ error: "Profile not found." });
    }
    const { label, address, is_default } = req.body;
    if (label) profile.label = String(label).trim();
    if (address) {
        try {
            profile.address = parsePublicKey(address, "wallet address").toString();
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
    if (is_default) {
        store.walletProfiles.forEach((item) => {
            item.is_default = item.id === profile.id;
        });
    }
    saveStore();
    res.json(profile);
});

app.get("/api/fees", (req, res) => {
    res.json({
        protocol_fee_bps: store.feeConfig.protocol_fee_bps,
        creator_split_bps: 10000 - store.feeConfig.protocol_fee_bps
    });
});

app.put("/api/fees", (req, res) => {
    return res.status(403).json({
        error: "Protocol fee is locked and cannot be changed."
    });
});

app.get("/api/webhook-logs", requireAdminSecret, (req, res) => {
    res.json(store.webhookLogs);
});

app.get("/api/admin/summary", requireAdminSecret, (req, res) => {
    const latestReceipts = store.receipts.slice(0, 12);
    const latestBlinks = store.blinks.slice(0, 12);
    res.json({
        metrics: computeMetrics(),
        walletProfiles: store.walletProfiles,
        webhookLogs: store.webhookLogs.slice(0, 24),
        receipts: latestReceipts,
        blinks: latestBlinks
    });
});

app.get("/api/admin/receipts/:token", requireAdminSecret, (req, res) => {
    const receipt = store.receipts.find((item) => item.token === req.params.token || item.id === req.params.token);
    if (!receipt) {
        return res.status(404).json({ error: "Receipt not found." });
    }
    res.json(receipt);
});

app.get("/api/receipt/:token", (req, res) => {
    const receipt = store.receipts.find((item) => item.token === req.params.token);
    if (!receipt) {
        return res.status(404).json({ error: "Receipt not found." });
    }
    res.json({
        receipt_id: receipt.id,
        created_at: receipt.created_at,
        blink_id: receipt.blink_id,
        title: receipt.title,
        price: receipt.price,
        currency: receipt.currency,
        category: receipt.category,
        buyer_account: receipt.buyer_account,
        transaction_signature: receipt.transaction_signature,
        delivery: receipt.delivery,
        routing: receipt.routing,
        receipt_url: `${PUBLIC_BASE_URL}/receipt/${receipt.token}`
    });
});

app.get("/receipt/:token", (req, res) => {
    const receipt = store.receipts.find((item) => item.token === req.params.token);
    if (!receipt) {
        return res.status(404).send("Receipt not found.");
    }
    const deliveryMarkup = receipt.delivery?.url
        ? `<a href="${escapeHtml(receipt.delivery.url)}" target="_blank" rel="noreferrer" style="color:#2563eb;font-weight:600;">Open delivery link</a>`
        : `<span>Delivery details are recorded in the confirmation log.</span>`;
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>NodeBlink Receipt</title>
    <style>
        body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f7f8fa;color:#0f172a;margin:0;padding:32px}
        .card{max-width:760px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px;box-shadow:0 18px 42px rgba(15,23,42,.08)}
        .muted{color:#64748b}
        .row{display:flex;justify-content:space-between;gap:20px;padding:12px 0;border-bottom:1px solid #e2e8f0}
        .label{color:#475569;font-size:12px;text-transform:uppercase;letter-spacing:.12em}
        .value{font-weight:600;word-break:break-word}
        a{color:#2563eb}
    </style>
</head>
<body>
    <div class="card">
        <p class="label">NodeBlink purchase receipt</p>
        <h1 style="margin:10px 0 6px;font-size:30px;">${escapeHtml(receipt.title)}</h1>
        <p class="muted" style="margin-top:0;">Your purchase was completed successfully. Save this page as proof of purchase.</p>
        <div class="row"><div><div class="label">Purchased on</div><div class="value">${escapeHtml(new Date(receipt.created_at).toLocaleString())}</div></div><div><div class="label">Price</div><div class="value">${escapeHtml(receipt.price)} ${escapeHtml(receipt.currency)}</div></div></div>
        <div class="row"><div><div class="label">Product</div><div class="value">${escapeHtml(receipt.title)}</div></div><div><div class="label">Category</div><div class="value">${escapeHtml(receipt.category)}</div></div></div>
        <div class="row"><div><div class="label">Buyer wallet</div><div class="value">${escapeHtml(receipt.buyer_account)}</div></div><div><div class="label">Blink ID</div><div class="value">${escapeHtml(receipt.blink_id)}</div></div></div>
        <div class="row"><div><div class="label">Transaction signature</div><div class="value">${escapeHtml(receipt.transaction_signature || "Pending / not provided")}</div></div></div>
        <div class="row"><div><div class="label">Delivery</div><div class="value">${deliveryMarkup}</div></div></div>
        <p class="muted" style="margin-top:18px;">Receipt token: ${escapeHtml(receipt.token)}</p>
    </div>
</body>
</html>`);
});

app.post("/api/admin/reissue-delivery", requireAdminSecret, async (req, res) => {
    const { blink_id, buyer_account, receipt_token } = req.body;
    if (!blink_id || !buyer_account) {
        return res.status(400).json({ error: "blink_id and buyer_account are required." });
    }
    const blink = store.blinks.find((item) => item.id === blink_id);
    if (!blink) {
        return res.status(404).json({ error: "Blink not found." });
    }

    let delivery = null;
    if (blink.category === "asset" && blink.asset_file_path) {
        const signed = createSignedDownload(blink.id, buyer_account, blink.asset_file_path, blink.asset_file_name);
        delivery = { url: signed.url, expires_at: signed.expires_at, token: signed.token };
        logWebhookEvent({ type: "admin_reissue_delivery", blink_id: blink.id, buyer_account, receipt_token: receipt_token || null, mode: "asset" });
    } else if (blink.category === "service" && blink.webhook_url) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        try {
            const webhookResponse = await fetch(blink.webhook_url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event: "blink_reissued",
                    blink_id: blink.id,
                    buyer_account,
                    receipt_token: receipt_token || null,
                    timestamp: new Date().toISOString()
                }),
                signal: controller.signal
            });
            delivery = { routed: webhookResponse.ok, status: webhookResponse.status };
        } catch (error) {
            delivery = { routed: false, error: error.name === "AbortError" ? "Webhook timed out" : error.message };
        } finally {
            clearTimeout(timeout);
        }
        logWebhookEvent({ type: "admin_reissue_delivery", blink_id: blink.id, buyer_account, receipt_token: receipt_token || null, mode: "service" });
    } else {
        return res.status(400).json({ error: "No reissue path available for this Blink." });
    }

    res.json({ ok: true, blink_id: blink.id, buyer_account, delivery });
});

app.get("/api/blinks", (req, res) => {
    // Allow public read-only access from any origin for listing blinks.
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(store.blinks.map((blink) => ({
        ...blink,
        blink_url: createBlinkUrl(blink.id)
    })));
});

const createBlinkLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

app.post("/api/blinks", createBlinkLimiter, upload.fields([
    { name: "asset_file", maxCount: 1 },
    { name: "banner_file", maxCount: 1 }
]), (req, res) => {
    const {
        title,
        price,
        currency,
        category,
        stock,
        webhook_url,
        creator_wallet_address
    } = req.body;

    const numericPrice = Number(price);
    const numericStock = Number(stock);
    const trimmedTitle = String(title || "").trim();
    const trimmedCurrency = String(currency || "").trim().toUpperCase();
    const trimmedCategory = String(category || "").trim().toLowerCase();

    if (!trimmedTitle || !Number.isFinite(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ error: "Title and price are required." });
    }
    if (!Number.isFinite(numericStock) || numericStock < 0) {
        return res.status(400).json({ error: "Stock must be 0 or greater. Use 0 for unlimited stock." });
    }
    if (!["SOL", "USDC"].includes(trimmedCurrency)) {
        return res.status(400).json({ error: "Currency must be SOL or USDC." });
    }
    if (!["asset", "service"].includes(trimmedCategory)) {
        return res.status(400).json({ error: "Category must be asset or service." });
    }

    let creatorAddress;
    try {
        creatorAddress = parsePublicKey(creator_wallet_address || DEFAULT_CREATOR_WALLET, "creator wallet");
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    const assetFile = req.files?.asset_file?.[0] || null;
    const bannerFile = req.files?.banner_file?.[0] || null;
    const cleanupUploads = () => {
        deleteUploadedFile(assetFile);
        deleteUploadedFile(bannerFile);
    };
    const rejectWithCleanup = (status, error) => {
        cleanupUploads();
        return res.status(status).json({ error });
    };

    if (trimmedCategory === "asset" && !assetFile) {
        return rejectWithCleanup(400, "Asset file is required for digital products.");
    }
    if (trimmedCategory === "service" && !webhook_url) {
        return rejectWithCleanup(400, "Webhook URL is required for service actions.");
    }

    let webhookUrl = null;
    if (trimmedCategory === "service") {
        try {
            webhookUrl = parseUrl(webhook_url);
        } catch (error) {
            return rejectWithCleanup(400, error.message);
        }
    }

    if (bannerFile && bannerFile.size > MAX_BANNER_FILE_BYTES) {
        return rejectWithCleanup(400, "Banner image must be 5MB or less.");
    }

    const id = crypto.randomUUID();
    const maxQuantity = Math.max(0, Math.floor(numericStock));
    // Asset files should NOT be exposed directly. Leave `asset_file_url` null
    // until a purchase generates a signed download link. Banner images are
    // safe to expose via the controlled `/uploads/:file` route.
    const assetFileUrl = null;
    const bannerFileUrl = bannerFile
        ? `${ASSET_BASE_URL}/uploads/${bannerFile.filename}`
        : null;

    const newBlink = {
        id,
        title: trimmedTitle,
        price: numericPrice,
        currency: trimmedCurrency,
        category: trimmedCategory,
        total_clicks: 0,
        total_sales: 0,
        max_quantity: maxQuantity,
        remaining_quantity: maxQuantity,
        asset_file_url: assetFileUrl,
        asset_file_path: assetFile ? assetFile.path : null,
        asset_file_name: assetFile ? assetFile.originalname : null,
        banner_file_url: bannerFileUrl,
        banner_file_path: bannerFile ? bannerFile.path : null,
        banner_file_name: bannerFile ? bannerFile.originalname : null,
        webhook_url: webhookUrl,
        creator_wallet_address: creatorAddress.toString(),
        created_at: new Date().toISOString()
    };

    store.blinks.unshift(newBlink);
    saveStore();
    logWebhookEvent({ type: "blink_created", blink_id: newBlink.id });
    res.status(201).json({ ...newBlink, blink_url: createBlinkUrl(id) });
});

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ error: "Uploads must be 100MB or less." });
    }
    return next(error);
});

app.get("/api/blink/:id", (req, res) => {
    const blink = store.blinks.find((item) => item.id === req.params.id);
    if (!blink) {
        return res.status(404).json({ error: "Blink not found." });
    }
    // Allow public read-only access to individual blink details from any origin.
    res.setHeader("Access-Control-Allow-Origin", "*");
    blink.total_clicks += 1;
    saveStore();
    logWebhookEvent({ type: "action_get", blink_id: blink.id });
    const isInfiniteStock = blink.max_quantity === 0;
    const isDisabled = !isInfiniteStock && blink.remaining_quantity <= 0;
    const descriptionBase = blink.category === "service"
        ? "Automated action routing for micro-transactions."
        : "Instant digital delivery with secure fulfillment.";
    const poweredBy = "Powered by NodeBlink • support@nodeblink.com";
    const actionLabel = isDisabled ? "Out of stock" : "Purchase with 1-click";
    const response = {
        type: "action",
        title: blink.title,
        description: `${descriptionBase} ${poweredBy}`,
        icon: blink.banner_file_url || blink.asset_file_url || `${PUBLIC_BASE_URL}/assets/blink-preview.svg`,
        label: actionLabel,
        disabled: isDisabled,
        price: { amount: blink.price, currency: blink.currency },
        blink_id: blink.id,
        links: {
            actions: [
                {
                    label: actionLabel,
                    href: `${PUBLIC_BASE_URL}/api/blink/${blink.id}`
                }
            ]
        },
        metadata: {
            powered_by: "NodeBlink",
            support_email: "support@nodeblink.com",
            website: PUBLIC_BASE_URL
        }
    };

    res.json(response);
});

app.post("/api/blink/:id", async (req, res) => {
    const blink = store.blinks.find((item) => item.id === req.params.id);
    if (!blink) {
        return res.status(404).json({ error: "Blink not found." });
    }

    const buyerAccount = req.body.account;
    if (!buyerAccount) {
        return res.status(400).json({ error: "Buyer account is required." });
    }

    const isInfiniteStock = blink.max_quantity === 0;
    if (!isInfiniteStock && blink.remaining_quantity <= 0) {
        return res.status(409).json({ error: "Out of stock." });
    }

    let buyer;
    let creator;
    let treasury;
    try {
        buyer = parsePublicKey(buyerAccount, "buyer wallet");
        creator = parsePublicKey(blink.creator_wallet_address, "creator wallet");
        treasury = parsePublicKey(TREASURY_WALLET, "treasury wallet");
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    const feeRate = store.feeConfig.protocol_fee_bps / 10000;
    const transaction = new Transaction();

    if (blink.currency === "SOL") {
        const totalLamports = Math.round(blink.price * LAMPORTS_PER_SOL);
        if (!Number.isFinite(totalLamports) || totalLamports <= 0) {
            return res.status(400).json({ error: "Invalid SOL amount." });
        }
        const feeLamports = Math.floor(totalLamports * feeRate);
        const creatorLamports = totalLamports - feeLamports;

        transaction.add(
            SystemProgram.transfer({
                fromPubkey: buyer,
                toPubkey: creator,
                lamports: creatorLamports
            }),
            SystemProgram.transfer({
                fromPubkey: buyer,
                toPubkey: treasury,
                lamports: feeLamports
            })
        );
    } else if (blink.currency === "USDC") {
        const totalUnits = BigInt(Math.round(blink.price * 10 ** USDC_DECIMALS));
        if (totalUnits <= 0n) {
            return res.status(400).json({ error: "Invalid USDC amount." });
        }
        const feeUnits = (totalUnits * BigInt(store.feeConfig.protocol_fee_bps)) / 10000n;
        const creatorUnits = totalUnits - feeUnits;

        const mint = parsePublicKey(USDC_MINT, "USDC mint");
        const buyerAta = await getAssociatedTokenAddress(mint, buyer);
        const creatorAta = await getAssociatedTokenAddress(mint, creator);
        const treasuryAta = await getAssociatedTokenAddress(mint, treasury);

        const buyerAccountInfo = await connection.getAccountInfo(buyerAta);
        if (!buyerAccountInfo) {
            return res.status(400).json({ error: "Buyer does not have a USDC token account." });
        }

        const creatorAccountInfo = await connection.getAccountInfo(creatorAta);
        if (!creatorAccountInfo) {
            transaction.add(
                createAssociatedTokenAccountInstruction(buyer, creatorAta, creator, mint)
            );
        }

        const treasuryAccountInfo = await connection.getAccountInfo(treasuryAta);
        if (!treasuryAccountInfo) {
            transaction.add(
                createAssociatedTokenAccountInstruction(buyer, treasuryAta, treasury, mint)
            );
        }

        if (creatorUnits > 0n) {
            transaction.add(
                createTransferCheckedInstruction(
                    buyerAta,
                    mint,
                    creatorAta,
                    buyer,
                    creatorUnits,
                    USDC_DECIMALS
                )
            );
        }
        if (feeUnits > 0n) {
            transaction.add(
                createTransferCheckedInstruction(
                    buyerAta,
                    mint,
                    treasuryAta,
                    buyer,
                    feeUnits,
                    USDC_DECIMALS
                )
            );
        }
    } else {
        return res.status(400).json({ error: "Unsupported currency." });
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = buyer;

    const serialized = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
    });

    res.json({
        transaction: serialized.toString("base64"),
        message: "Authorize purchase with 1-click",
        amount: blink.price,
        currency: blink.currency,
        last_valid_block_height: lastValidBlockHeight
    });

    logWebhookEvent({ type: "action_post", blink_id: blink.id, buyer_account: buyerAccount });
});

app.post("/api/webhook/solana-confirm", async (req, res) => {
    const { blink_id, buyer_account, transaction_signature } = req.body;
    if (!blink_id || !buyer_account) {
        return res.status(400).json({ error: "Missing blink_id or buyer_account." });
    }

    const blink = store.blinks.find((item) => item.id === blink_id);
    if (!blink) {
        return res.status(404).json({ error: "Blink not found." });
    }

    const isInfiniteStock = blink.max_quantity === 0;
    if (!isInfiniteStock && blink.remaining_quantity <= 0) {
        return res.status(409).json({ error: "Out of stock." });
    }

    blink.total_sales += 1;
    if (!isInfiniteStock) {
        blink.remaining_quantity -= 1;
    }
    saveStore();

    let delivery = null;
    if (blink.category === "asset" && blink.asset_file_path) {
        const signed = createSignedDownload(blink.id, buyer_account, blink.asset_file_path, blink.asset_file_name);
        delivery = { url: signed.url, expires_at: signed.expires_at };
    }

    let routing = null;
    if (blink.category === "service" && blink.webhook_url) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        try {
            const webhookResponse = await fetch(blink.webhook_url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    event: "blink_confirmed",
                    blink_id: blink.id,
                    buyer_account,
                    title: blink.title,
                    price: blink.price,
                    currency: blink.currency,
                    timestamp: new Date().toISOString()
                }),
                signal: controller.signal
            });
            routing = {
                routed: webhookResponse.ok,
                status: webhookResponse.status
            };
            if (!webhookResponse.ok) {
                routing.error = `Webhook responded with ${webhookResponse.status}`;
            }
        } catch (error) {
            routing = {
                routed: false,
                error: error.name === "AbortError" ? "Webhook timed out" : error.message
            };
        } finally {
            clearTimeout(timeout);
        }
    }

    logWebhookEvent({ type: "confirm", blink_id: blink.id, buyer_account });
    if (routing) {
        logWebhookEvent({ type: "webhook_delivery", blink_id: blink.id, buyer_account, ...routing });
    }

    const receipt = createReceiptRecord({
        blink,
        buyerAccount: buyer_account,
        transactionSignature: transaction_signature,
        delivery,
        routing
    });

    res.json({
        status: "confirmed",
        blink_id: blink.id,
        remaining_quantity: blink.remaining_quantity,
        delivery,
        routing,
        receipt
    });
});

app.get("/api/download/:token", (req, res) => {
    const token = req.params.token;
    const signature = req.query.sig;
    const exp = Number(req.query.exp);

    const record = downloadTokens.get(token);
    if (!record) {
        return res.status(404).json({ error: "Download token not found." });
    }
    if (signature !== record.signature || exp !== record.expires_at) {
        return res.status(403).json({ error: "Invalid download token." });
    }
    if (Date.now() > record.expires_at) {
        downloadTokens.delete(token);
        return res.status(410).json({ error: "Download token expired." });
    }
    if (!record.filePath) {
        return res.status(404).json({ error: "Asset file unavailable." });
    }
    res.download(record.filePath, record.fileName || "asset");
});

app.listen(PORT, () => {
    console.log(`NodeBlink server listening on ${PUBLIC_BASE_URL}`);
});
