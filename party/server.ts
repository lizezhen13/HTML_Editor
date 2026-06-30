// ─────────────────────────────────────────────────
//  PartyKit server  ·  one Durable Object per room.
//  y-partykit handles the Yjs sync protocol over WebSocket.
//  Doc state persists via snapshot to room storage.
// ─────────────────────────────────────────────────

import type * as Party from "partykit/server";
import { onConnect } from "y-partykit";

const ACCESS_PROOF_HASH_KEY = "hce:access-proof-hash";
const OWNER_PROOF_HASH_KEY = "hce:owner-proof-hash";

type AuthBody = {
  accessProof?: string;
  ownerProof?: string;
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Cache-Control": "no-store",
  };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function isValidProof(proof: unknown): proof is string {
  return typeof proof === "string" && /^[A-Za-z0-9_-]{32,128}$/.test(proof);
}

function base64Url(bytes: ArrayBuffer) {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hashProof(kind: "access" | "owner", proof: string) {
  const bytes = new TextEncoder().encode(`hce:${kind}:stored:v1:${proof}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return base64Url(digest);
}

export default class CollabServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  async onRequest(req: Request) {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (req.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405);
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    let body: AuthBody = {};
    try {
      body = (await req.json()) as AuthBody;
    } catch {
      return json({ error: "invalid_json" }, 400);
    }

    if (action === "access-status") {
      return this.handleAccessStatus(body);
    }
    if (action === "set-access-key") {
      return this.handleSetAccessKey(body);
    }
    if (action === "verify-access-key") {
      return this.handleVerifyAccessKey(body);
    }

    return json({ error: "not_found" }, 404);
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const authorized = await this.authorizeConnect(ctx.request);
    if (!authorized) {
      conn.close(4401, "Access key required");
      return;
    }

    return onConnect(conn, this.room, {
      persist: { mode: "snapshot" },
    });
  }

  private async handleAccessStatus(body: AuthBody) {
    const [accessHash, storedOwnerHash] = await Promise.all([
      this.room.storage.get<string>(ACCESS_PROOF_HASH_KEY),
      this.room.storage.get<string>(OWNER_PROOF_HASH_KEY),
    ]);
    let ownerHash = storedOwnerHash;
    if (!ownerHash && isValidProof(body.ownerProof)) {
      ownerHash = await hashProof("owner", body.ownerProof);
      await this.room.storage.put(OWNER_PROOF_HASH_KEY, ownerHash);
    }
    const isOwner = await this.matchesStoredProof("owner", body.ownerProof, ownerHash);
    return json({ hasAccessKey: !!accessHash, isOwner });
  }

  private async handleSetAccessKey(body: AuthBody) {
    if (!isValidProof(body.ownerProof)) {
      return json({ error: "owner_required" }, 403);
    }
    if (!isValidProof(body.accessProof)) {
      return json({ error: "invalid_access_key" }, 400);
    }

    let ownerHash = await this.room.storage.get<string>(OWNER_PROOF_HASH_KEY);
    const nextOwnerHash = await hashProof("owner", body.ownerProof);
    if (!ownerHash) {
      await this.room.storage.put(OWNER_PROOF_HASH_KEY, nextOwnerHash);
      ownerHash = nextOwnerHash;
    }
    if (ownerHash !== nextOwnerHash) {
      return json({ error: "owner_required" }, 403);
    }

    const existing = await this.room.storage.get<string>(ACCESS_PROOF_HASH_KEY);
    if (existing) {
      return json({ error: "access_key_already_set" }, 409);
    }

    await this.room.storage.put(ACCESS_PROOF_HASH_KEY, await hashProof("access", body.accessProof));
    return json({ ok: true, hasAccessKey: true });
  }

  private async handleVerifyAccessKey(body: AuthBody) {
    const accessHash = await this.room.storage.get<string>(ACCESS_PROOF_HASH_KEY);
    if (!accessHash) {
      return json({ error: "access_key_not_set" }, 404);
    }
    const ok = await this.matchesStoredProof("access", body.accessProof, accessHash);
    if (!ok) {
      return json({ error: "invalid_access_key" }, 403);
    }
    return json({ ok: true });
  }

  private async authorizeConnect(req: Request) {
    const url = new URL(req.url);
    const ownerProof = url.searchParams.get("owner") || "";
    const accessProof = url.searchParams.get("access") || "";

    let ownerHash = await this.room.storage.get<string>(OWNER_PROOF_HASH_KEY);
    if (!ownerHash && isValidProof(ownerProof)) {
      ownerHash = await hashProof("owner", ownerProof);
      await this.room.storage.put(OWNER_PROOF_HASH_KEY, ownerHash);
    }

    const accessHash = await this.room.storage.get<string>(ACCESS_PROOF_HASH_KEY);
    if (accessHash) {
      if (await this.matchesStoredProof("access", accessProof, accessHash)) return true;
      if (await this.matchesStoredProof("owner", ownerProof, ownerHash)) return true;
      return false;
    }

    return this.matchesStoredProof("owner", ownerProof, ownerHash);
  }

  private async matchesStoredProof(
    kind: "access" | "owner",
    proof: string | undefined,
    storedHash: string | undefined,
  ) {
    if (!storedHash || !isValidProof(proof)) return false;
    return (await hashProof(kind, proof)) === storedHash;
  }
}

CollabServer satisfies Party.Worker;
