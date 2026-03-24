import { config } from "dotenv";
config(); // Load .env before initializing db

import { connectDB } from "../lib/db";
import User from "../models/User";
import bcrypt from "bcryptjs";
import readline from "readline";

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => 
  new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  console.log("=== GovIntel Admin Setup ===");
  try {
    const email = await question("Enter Admin Email (e.g., admin@mahagov.in): ");
    const name = await question("Enter Admin Name: ");
    const mobile = await question("Enter Admin Mobile/Phone: ");
    const password = await question("Enter Admin Password: ");

    if (!email || !name || !password || !mobile) {
      console.log("All fields are required. Aborting.");
      process.exit(1);
    }

    await connectDB();
    
    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      const reset = await question(`User ${email} already exists. Reset password and make ADMIN? (y/n): `);
      if (reset.toLowerCase() !== 'y') {
        console.log("Aborted.");
        process.exit(0);
      }
      
      existing.password = await hashPassword(password);
      existing.role = "ADMIN";
      existing.isActive = true;
      existing.name = name;
      existing.mobile = mobile;
      existing.assignedDistrict = "Nashik";
      existing.assignedTalukas = [
        "Chandwad", "Deola", "Dindori", "Igatpuri", "Kalwan", 
        "Malegaon", "Nandgaon", "Nashik", "Niphad", 
        "Peth (Peint)", "Sinnar", "Surgana", "Trimbakeshwar", "Yeola"
      ];
      await existing.save();
      
      console.log("✅ Admin user updated successfully!");
      process.exit(0);
    }

    const hashedPassword = await hashPassword(password);

    await User.create({
      name,
      email: email.toLowerCase(),
      mobile,
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
      isEmailVerified: true,
      assignedDistrict: "Nashik",
      assignedTalukas: [
        "Chandwad", "Deola", "Dindori", "Igatpuri", "Kalwan", 
        "Malegaon", "Nandgaon", "Nashik", "Niphad", 
        "Peth (Peint)", "Sinnar", "Surgana", "Trimbakeshwar", "Yeola"
      ]
    });

    console.log("✅ Admin user created successfully!");
    console.log(`You can now log in at /login with ${email}`);

  } catch (err) {
    console.error("❌ Error creating admin user:", err);
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdmin();
