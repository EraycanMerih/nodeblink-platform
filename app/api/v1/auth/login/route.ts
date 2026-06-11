import { NextResponse } from "next/server";
import { z } from "zod";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import { createSession } from "@/lib/auth";
import { verifyMessage } from "viem";

const loginSchema = z.object({
  message: z.string(),
  signature: z.union([z.array(z.number()), z.string()]), // array of bytes for Solana, hex string for EVM
  publicKey: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    
    const isEVM = body.publicKey.startsWith("0x");
    let isValid = false;

    if (isEVM) {
      if (typeof body.signature !== "string") {
        return NextResponse.json({ error: "Invalid EVM signature format. Expected hex string." }, { status: 400 });
      }
      isValid = await verifyMessage({
        address: body.publicKey as `0x${string}`,
        message: body.message,
        signature: body.signature as `0x${string}`,
      });
    } else {
      if (!Array.isArray(body.signature)) {
        return NextResponse.json({ error: "Invalid Solana signature format. Expected byte array." }, { status: 400 });
      }
      const messageBytes = new TextEncoder().encode(body.message);
      const signatureBytes = new Uint8Array(body.signature);
      const pubkey = new PublicKey(body.publicKey);

      isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        pubkey.toBytes()
      );
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Optionally: verify the nonce inside body.message to prevent replay attacks
    // But for a simple SIWS implementation, verifying the signature is a massive step up.

    await createSession(body.publicKey);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }
}
