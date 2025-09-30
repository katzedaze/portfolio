import "dotenv/config";

// Better AuthのAPIを使用してユーザーを作成するスクリプト
async function seedViaAPI() {
  console.log("🌱 Creating admin user via Better Auth API...");

  try {
    const response = await fetch(
      "http://localhost:3000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@example.com",
          password: "admin123",
          name: "Admin",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create user: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log("✅ Admin user created successfully:", result);
    console.log("\n📧 Admin Email: admin@example.com");
    console.log("🔑 Admin Password: admin123");
    console.log("\n⚠️  Please change the admin password after first login!\n");
  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
    process.exit(1);
  }
}

seedViaAPI();
