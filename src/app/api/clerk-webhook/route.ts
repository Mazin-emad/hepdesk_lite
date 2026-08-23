import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { syncUserProfile } from "@/lib/firestore-service";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  if (WEBHOOK_SECRET && svix_id && svix_timestamp && svix_signature) {
    const wh = new Webhook(WEBHOOK_SECRET);
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying Clerk webhook signature:", err);
      return new Response("Webhook verification failed", { status: 400 });
    }
  } else {
    // Development / mock fallback
    evt = payload as WebhookEvent;
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, first_name, last_name, email_addresses } = evt.data;
    const name = [first_name, last_name].filter(Boolean).join(" ") || "User";
    const email = email_addresses?.[0]?.email_address || "";

    try {
      await syncUserProfile({
        uid: id,
        name,
        email,
        role: "employee", // Default role on creation
      });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
      console.error("Error syncing user to Firestore:", err);
      return new Response("Error syncing user", { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
