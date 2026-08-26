import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customToken = await adminAuth.createCustomToken(userId);

    return NextResponse.json({ token: customToken });
  } catch (error) {
    console.error("Failed to mint Firebase custom token:", error);
    return NextResponse.json(
      { error: "Unable to mint Firebase token" },
      { status: 500 }
    );
  }
}
