import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { fullName, username, email, password } = await req.json();

    if (!fullName || !username || !email || !password) {
      return NextResponse.json(
        { message: "تمام معلومات ضروری ہیں۔" },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    
    // Try database first
    if (db) {
      const usersCollection = db.collection("users");
      
      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { message: "یہ ای میل پہلے سے رجسٹرڈ ہے! براہ کرم لاگ ان کریں۔" },
          { status: 409 }
        );
      }

      const newUser = {
        fullName,
        username,
        email: email.toLowerCase(),
        password,
        authMethod: "Email Registry (Atlas Core Connected)",
        createdAt: new Date().toISOString()
      };

      await usersCollection.insertOne(newUser);

      return NextResponse.json({
        success: true,
        user: {
          fullName: newUser.fullName,
          username: newUser.username,
          email: newUser.email,
          authMethod: newUser.authMethod
        }
      });
    } else {
      // Fallback: return success and let client handle storage
      // This is for development without MongoDB
      return NextResponse.json({
        success: true,
        user: {
          fullName,
          username,
          email: email.toLowerCase(),
          authMethod: "Email Registry (Local Storage)"
        }
      });
    }

  } catch (err: any) {
    console.error("Server Signup Exception:", err);
    return NextResponse.json(
      { message: `ڈیٹا بیس رجسٹریشن میں خرابی: ${err.message || err}` },
      { status: 500 }
    );
  }
}
