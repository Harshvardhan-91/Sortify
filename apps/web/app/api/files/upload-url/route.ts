import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileName, mimeType } = await request.json();

    if (!fileName || !mimeType) {
      return NextResponse.json(
        { error: "fileName and mimeType are required" },
        { status: 400 }
      );
    }

    // Generate a unique key for the file
    const timestamp = Date.now();
    const key = `uploads/${session.user.email}/${timestamp}-${fileName}`;

    // For local development, we'll use a local upload endpoint
    // In production with S3, this would return a signed upload URL
    const uploadUrl = `/api/files/local-upload`;

    return NextResponse.json({
      uploadUrl,
      key,
      message: "Local upload URL generated (S3 alternative)",
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
