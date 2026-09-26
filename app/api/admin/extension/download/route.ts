import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { validateAdminAuth, unauthorizedResponse } from "../../../../../lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = validateAdminAuth(req);
  if (!auth.authorized) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const extensionDir = path.join(process.cwd(), "extension");
    if (!fs.existsSync(extensionDir)) {
      return NextResponse.json(
        { success: false, message: "Extension directory not found on server." },
        { status: 404 }
      );
    }

    const zip = new JSZip();
    const files = fs.readdirSync(extensionDir);

    for (const file of files) {
      const filePath = path.join(extensionDir, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const fileContent = fs.readFileSync(filePath);
        zip.file(file, fileContent);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="style-advisor-extension.zip"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("[Extension Download Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to package extension." },
      { status: 500 }
    );
  }
}
