// scripts/ddosSeed.ts
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

import DDOSData from "../models/ddosData";

const MONGODB_URI = process.env.MONGODB_URI!;

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB Connected");

    const filePath = path.join(process.cwd(), "result.json");

    const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const formattedData = rawData.map((district: any) => ({
      district: district["District"],
      ddoCount: district["DDO Count"],

      treasuries: district.treasuries.map((treasury: any) => ({
        treasury: treasury["Treasury"],
        ddoCount: treasury["DDO Count"],

        ddos: treasury.ddos.map((ddo: any) => ({
          // swapped intentionally
          ddoCode: ddo["DDo Code"],
          ddoName: ddo["DDO Name"],
        })),
      })),
    }));

    await DDOSData.deleteMany();

    await DDOSData.insertMany(formattedData);

    console.log("DDO Data Seeded Successfully");

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();