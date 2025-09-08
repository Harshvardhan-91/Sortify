import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { key, fileName, mimeType, size, folderId } = await request.json();

    if (!key || !fileName) {
      return NextResponse.json(
        { error: "key and fileName are required" },
        { status: 400 }
      );
    }

    // In a real app, you would save this to your database
    // For now, we'll just return success with file metadata
    const file = {
      id: `file-${Date.now()}`,
      name: fileName,
      type: "file" as const,
      size: size || 0,
      mimeType: mimeType || "application/octet-stream",
      url: `/uploads/${key}`,
      key,
      folderId: folderId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: session.user.email,
    };

    return NextResponse.json({
      file,
      success: true,
      message: "Upload confirmed and metadata saved (local storage)",
    });
  } catch (error) {
    console.error("Error confirming upload:", error);
    return NextResponse.json(
      { error: "Failed to confirm upload" },
      { status: 500 }
    );
  }
}
