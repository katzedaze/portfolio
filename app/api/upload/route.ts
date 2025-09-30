import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "画像ファイル（JPEG, PNG, WebP, GIF）のみアップロード可能です",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "ファイルサイズは5MB以下にしてください" },
        { status: 400 }
      );
    }

    const isDevelopment = process.env.NODE_ENV === "development";

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const filename = `avatar-${timestamp}.${ext}`;

    if (isDevelopment) {
      // 開発環境: ローカルファイルシステムに保存
      const { writeFile, mkdir } = await import("fs/promises");
      const { join } = await import("path");
      const { existsSync } = await import("fs");

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Ensure upload directory exists
      const uploadDir = join(process.cwd(), "public", "uploads");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Save file
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);

      // Return public URL
      const url = `/uploads/${filename}`;
      return NextResponse.json({ url });
    } else {
      // 本番環境: Vercel Blobに保存
      const { put } = await import("@vercel/blob");

      const blob = await put(`avatars/${filename}`, file, {
        access: "public",
      });

      return NextResponse.json({ url: blob.url });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "アップロードに失敗しました" },
      { status: 500 }
    );
  }
}
