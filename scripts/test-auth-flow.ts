/**
 * Test script for verifying the authentication flow and role-based redirections
 * Run with: bun run scripts/test-auth-flow.ts
 */
const BASE_URL = "http://localhost:3000";
const LANG = "en"; // Default language for testing

const generateTestUser = (role: "BUYER" | "SELLER") => {
  // Generate a random string for unique email addresses
  const randomId = Math.random().toString(36).substring(2, 10);
  return {
    name: `Test User ${randomId}`,
    email: `test${randomId}@example.com`,
    password: "Password123!",
    role
  };
};

const registerUser = async (user: ReturnType<typeof generateTestUser>) => {
  console.log(`Registering ${user.role} with email: ${user.email}`);
  
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  
  return await response.json();
};

const loginUser = async (email: string, password: string) => {
  // First get CSRF token
  const csrfResponse = await fetch(`${BASE_URL}/api/auth/csrf`);
  const { csrfToken } = await csrfResponse.json();
  
  // Then login with credentials
  const loginResponse = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      csrfToken,
      email,
      password,
      callbackUrl: `/${LANG}/dashboard`
    }),
  });
  
  // Get cookies for session
  const cookies = loginResponse.headers.get("set-cookie");
  
  return { loginResponse, cookies };
};

const getUserInfo = async (cookies: string | null) => {
  if (!cookies) {
    throw new Error("No cookies provided");
  }
  
  const response = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: {
      "Cookie": cookies
    }
  });
  
  return await response.json();
};

// Test buyer registration and redirection
async function testBuyerRegistration() {
  try {
    // 1. Register a new buyer
    const buyerUser = generateTestUser("BUYER");
    const registerResult = await registerUser(buyerUser);
    console.log("Registration result:", registerResult);
    
    // 2. Login with the new user
    const { loginResponse, cookies } = await loginUser(buyerUser.email, buyerUser.password);
    console.log("Login status:", loginResponse.status);
    
    // 3. Get user info to verify role
    if (cookies) {
      const userInfo = await getUserInfo(cookies);
      console.log("User info:", userInfo);
      
      // 4. Verify that the role is set correctly
      if (userInfo.user?.role === "BUYER") {
        console.log("✅ User role correctly set to BUYER");
      } else {
        console.log("❌ User role not set correctly. Expected BUYER, got:", userInfo.user?.role);
      }
    }
  } catch (error) {
    console.error("Error in buyer test:", error);
  }
}

// Test seller registration and redirection
async function testSellerRegistration() {
  try {
    // 1. Register a new seller
    const sellerUser = generateTestUser("SELLER");
    const registerResult = await registerUser(sellerUser);
    console.log("Registration result:", registerResult);
    
    // 2. Login with the new user
    const { loginResponse, cookies } = await loginUser(sellerUser.email, sellerUser.password);
    console.log("Login status:", loginResponse.status);
    
    // 3. Get user info to verify role
    if (cookies) {
      const userInfo = await getUserInfo(cookies);
      console.log("User info:", userInfo);
      
      // 4. Verify that the role is set correctly
      if (userInfo.user?.role === "SELLER") {
        console.log("✅ User role correctly set to SELLER");
      } else {
        console.log("❌ User role not set correctly. Expected SELLER, got:", userInfo.user?.role);
      }
    }
  } catch (error) {
    console.error("Error in seller test:", error);
  }
}

// Main execution
async function runTests() {
  console.log("Starting authentication flow tests...");
  
  await testBuyerRegistration();
  await testSellerRegistration();
  
  console.log("Tests complete!");
}

// Run the tests
runTests();
