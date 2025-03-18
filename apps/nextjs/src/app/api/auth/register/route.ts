import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import prisma from "@saasfly/db";

// Define the request body schema
const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["BUYER", "SELLER"]).default("BUYER")
});

type RegisterRequestBody = z.infer<typeof registerSchema>;

type RegisterResponse = {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  }
};

export async function POST(req: NextRequest): Promise<NextResponse<RegisterResponse>> {
  try {
    // Parse the request body with proper typing
    const body = await req.json() as RegisterRequestBody;
    const { name, email, password, role } = body;

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    if (!z.string().email().safeParse(email).success) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Check if the user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "User with this email already exists" },
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Hash the password
      const hashedPassword = await hash(password, 10);

      // Generate a UUID for the user
      const userId = uuid();

      // Create the user with the selected role
      const result = await prisma.user.create({
        data: {
          id: userId,
          name,
          email,
          password: hashedPassword,
          role: role || "BUYER", // Default to BUYER if not specified
        },
      });

      return NextResponse.json(
        { 
          success: true, 
          message: "User registered successfully", 
          user: { 
            id: result.id, 
            name: result.name, 
            email: result.email,
            role: result.role
          }
        },
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (dbError: any) {
      console.error("Database error:", dbError);

      // Handle database connection errors specifically
      if (dbError.code === "ECONNREFUSED" || 
          (dbError.message && (
             dbError.message.includes("ECONNREFUSED") || 
             dbError.message.includes("Connection timeout") || 
             dbError.message.includes("WebSocket")))) {
        return NextResponse.json(
          {
            success: false,
            message: "Database connection error. Please verify your database service is running.",
            details: process.env.NODE_ENV === "development" ? dbError.message : undefined,
          },
          { status: 503, headers: { 'Content-Type': 'application/json' } },
        );
      }

      // Generic database error
      return NextResponse.json(
        {
          success: false,
          message: "Database error occurred",
          details: process.env.NODE_ENV === "development" ? dbError instanceof Error ? dbError.message : String(dbError) : undefined,
        },
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  } catch (error: any) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
        details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : undefined,
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
