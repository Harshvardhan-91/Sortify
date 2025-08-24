import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, return empty array since we don't have a database setup for files yet
    // In a real app, you would query your database here
    return NextResponse.json({
      files: [],
      success: true,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        files: [],
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // For now, just return success with file info
    // In a real app, you would:
    // 1. Save files to storage (S3, local filesystem, etc.)
    // 2. Save file metadata to database
    // 3. Return the saved file information

    const uploadedFiles = files.map((file, index) => ({
      id: `uploaded-${Date.now()}-${index}`,
      name: file.name,
      type: "file" as const,
      size: file.size,
      mimeType: file.type,
      createdAt: new Date(),
      updatedAt: new Date(),
      url: "#", // In real app, this would be the actual file URL
    }));

    return NextResponse.json({
      files: uploadedFiles,
      success: true,
      message: `Successfully uploaded ${files.length} file(s)`,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      {
        error: "Failed to upload files",
      },
      { status: 500 },
    );
  }
}
