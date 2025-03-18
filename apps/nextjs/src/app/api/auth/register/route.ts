import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { neon } from "@neondatabase/serverless";

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
      // Use the Neon serverless driver directly for better compatibility
      const sql = neon(process.env.DATABASE_URL || "");
      
      // Check if the user already exists using direct SQL query
      const existingUsers = await sql`SELECT * FROM "User" WHERE email = ${email}`;
      
      if (existingUsers.length > 0) {
        return NextResponse.json(
          { success: false, message: "User with this email already exists" },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Hash the password
      const hashedPassword = await hash(password, 10);
      
      // Create the user with direct SQL - ensure field names match schema exactly
      const userId = uuid();
      
      // The User table doesn't have createdAt and updatedAt columns, so only insert fields that exist
      const newUser = await sql`
        INSERT INTO "User" (id, name, email, password, role) 
        VALUES (${userId}, ${name}, ${email}, ${hashedPassword}, ${role}) 
        RETURNING id, name, email, role
      `;

      // Transform the user object to match the expected type with type safety
      const formattedUser = newUser[0] ? {
        id: newUser[0].id || userId,
        name: newUser[0].name || name,
        email: newUser[0].email || email,
        role: newUser[0].role || role
      } : {
        id: userId,
        name: name,
        email: email,
        role: role
      };

      return NextResponse.json(
        { 
          success: true, 
          message: "User registered successfully", 
          user: formattedUser
        },
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { success: false, message: "Database error occurred" },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { success: false, message: "Server error occurred" },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
