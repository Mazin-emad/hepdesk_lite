import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";

type ClerkWebhookUserData = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email_addresses?: Array<{ email_address?: string }>;
};

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not configured.");
    return new Response("Webhook is not configured", { status: 500 });
  }

  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(webhookSecret);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying Clerk webhook signature:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, first_name, last_name, email_addresses } =
      evt.data as ClerkWebhookUserData;
    const name = [first_name, last_name].filter(Boolean).join(" ") || "User";
    const email = email_addresses?.[0]?.email_address || "";

    try {
      const userDocRef = adminDb.collection("users").doc(id);
      const existingSnap = await userDocRef.get();
      const existing = existingSnap.exists
        ? (existingSnap.data() as {
            role?: "employee" | "staff" | "manager";
            createdAt?: string;
          })
        : null;

      await userDocRef.set({
        uid: id,
        name,
        email,
        role: existing?.role || "employee",
        createdAt: existing?.createdAt || new Date().toISOString(),
        disabled: false,
        updatedAt: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
      console.error("Error syncing user to Firestore:", err);
      return new Response("Error syncing user", { status: 500 });
    }
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data as { id: string };
    try {
      const userDocRef = adminDb.collection("users").doc(id);
      await userDocRef.set(
        {
          disabled: true,
          deletedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
      console.error("Error soft-disabling user in Firestore:", err);
      return new Response("Error disabling user", { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
