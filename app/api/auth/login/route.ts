import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "ای میل اور پاس ورڈ ضروری ہیں" },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    
    // Try database first
    if (db) {
      const usersCollection = db.collection("users");
      const user = await usersCollection.findOne({ email: email.toLowerCase() });

      if (!user) {
        return NextResponse.json(
          { message: "یہ ای میل ڈیٹا بیس میں موجود نہیں ہے!" },
          { status: 404 }
        );
      }

      if (user.password !== password) {
        return NextResponse.json(
          { message: "غلط پاس ورڈ! براہ کرم اپنا پاس ورڈ دوبارہ درج کریں۔" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          fullName: user.fullName || "User",
          username: user.username || "user",
          email: user.email,
          authMethod: user.authMethod || "Email Verification (Atlas Core Connected)"
        }
      });
    } else {
      // Fallback: return error for development (user must signup first)
      return NextResponse.json(
        { message: "لاگ ان کے لیے پہلے سائن اپ کریں" },
        { status: 401 }
      );
    }

  } catch (err: any) {
    console.error("Server Login Exception:", err);
    return NextResponse.json(
      { message: `ڈیٹا بیس تصدیق میں خرابی: ${err.message || err}` },
      { status: 500 }
    );
  }
}
