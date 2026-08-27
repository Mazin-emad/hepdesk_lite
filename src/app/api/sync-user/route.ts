import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name : "User";
    const email = typeof body?.email === "string" ? body.email : "";

    const userDocRef = adminDb.collection("users").doc(userId);
    const existingSnap = await userDocRef.get();
    const existing = existingSnap.exists
      ? (existingSnap.data() as {
          role?: "employee" | "staff" | "manager";
          createdAt?: string;
          disabled?: boolean;
        })
      : null;

    const profile = {
      uid: userId,
      name: name || "User",
      email: email || "",
      role: existing?.role || "employee",
      createdAt: existing?.createdAt || new Date().toISOString(),
      disabled: false,
      updatedAt: new Date().toISOString(),
    };

    await userDocRef.set(profile, { merge: true });

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error("Error in sync-user route:", err);
    return NextResponse.json(
      { error: "Failed to sync user profile" },
      { status: 500 }
    );
  }
}
