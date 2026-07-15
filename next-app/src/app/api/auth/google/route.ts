import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "hyriq_super_secret_key_2026";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export async function POST(req: Request) {
  try {
    const { code, role, couponCode, redirectUri } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "OAuth authorization code is required" },
        { status: 400 }
      );
    }

    console.log("Google Auth Debug - Client ID length:", GOOGLE_CLIENT_ID?.length, "Secret length:", GOOGLE_CLIENT_SECRET?.length);

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "Google OAuth credentials are not configured on the server." },
        { status: 500 }
      );
    }

    const client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      redirectUri || "http://localhost:3000/auth/google/callback"
    );

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const idToken = tokens.id_token;
    if (!idToken) {
      return NextResponse.json(
        { error: "Failed to retrieve ID Token from Google." },
        { status: 400 }
      );
    }

    // Verify token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: "Invalid ID Token payload from Google." },
        { status: 400 }
      );
    }

    const googleEmail = payload.email.toLowerCase();
    const googleName = payload.name || payload.given_name || "Google User";
    const googlePicture = payload.picture || "";

    // 1. Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: googleEmail, mode: "insensitive" } },
    });

    if (existingUser) {
      const token = jwt.sign(
        { id: existingUser.id, email: existingUser.email, role: existingUser.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Set HTTP-Only Cookie
      const cookieStore = await cookies();
      cookieStore.set("hyriq_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      return NextResponse.json({
        token,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
          name: existingUser.name,
          subscriptionExpiry: existingUser.subscriptionExpiry?.toISOString() || null,
        },
      });
    }

    // 2. User doesn't exist, sign them up
    const targetRole = role === "recruiter" ? "recruiter" : "candidate";

    // Recruiters are FREE
    if (targetRole === "recruiter") {
      const userId = `user-${Date.now()}`;
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: googleEmail,
          passwordHash: "",
          role: "recruiter",
          name: googleName,
          phone: "",
          bio: "",
          companyName: `${googleName}'s Organization`,
          companyBio: "We are hiring progressive talent.",
        },
      });

      const token = jwt.sign(
        { id: userId, email: googleEmail, role: "recruiter" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const cookieStore = await cookies();
      cookieStore.set("hyriq_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return NextResponse.json(
        {
          token,
          user: {
            id: userId,
            email: googleEmail,
            role: "recruiter",
            name: googleName,
          },
        },
        { status: 201 }
      );
    }

    // Candidates pay ₹99 (unless they have valid coupon code)
    const validCoupons = ["FREE100", "HYRIQ100", "FIRST100"];
    const isCouponValid = couponCode && validCoupons.includes(couponCode.toUpperCase());

    if (!isCouponValid) {
      // Return 200 with requiresPayment so frontend initiates Razorpay flow
      return NextResponse.json({
        requiresPayment: true,
        email: googleEmail,
        name: googleName,
        googlePicture,
        amount: 99,
        message: "A one-time registration fee of ₹99 is required for job seekers.",
      });
    }

    // Create Candidate with coupon code bypass
    const userId = `user-${Date.now()}`;
    const subscriptionExpiry = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000); // 100 years lifetime
    const initialPreferences = {
      plan: "launch",
      type: [],
      mode: [],
      minSalary: 0,
      experience: "Entry-level"
    };

    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: googleEmail,
        passwordHash: "",
        role: "candidate",
        name: googleName,
        phone: "",
        bio: "",
        skills: [],
        experience: "Entry-level",
        resumeName: "No resume uploaded",
        onboardingCompleted: false,
        subscriptionExpiry,
        preferences: initialPreferences
      },
    });

    const token = jwt.sign(
      { id: userId, email: googleEmail, role: "candidate" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    cookieStore.set("hyriq_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json(
      {
        token,
        user: {
          id: userId,
          email: googleEmail,
          role: "candidate",
          name: googleName,
          subscriptionExpiry: subscriptionExpiry.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Google OAuth API Error:", err);
    return NextResponse.json(
      { error: "Google Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
