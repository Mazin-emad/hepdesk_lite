import { NextResponse } from "next/server";
import { syncUserProfile } from "@/lib/firestore-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { uid, name, email, role } = body;

    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const profile = await syncUserProfile({
      uid,
      name: name || "User",
      email: email || "",
      role: role || "employee",
    });

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error("Error in sync-user route:", err);
    return NextResponse.json(
      { error: "Failed to sync user profile" },
      { status: 500 }
    );
  }
}
