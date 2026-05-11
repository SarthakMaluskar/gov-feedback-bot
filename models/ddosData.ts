// models/ddosData.ts

import mongoose from "mongoose";

const ddoSchema = new mongoose.Schema(
  {
    ddoCode: {
      type: String,
      required: true,
    },
    ddoName: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const treasurySchema = new mongoose.Schema(
  {
    treasury: {
      type: String,
      required: true,
    },
    ddoCount: {
      type: Number,
      required: true,
    },
    ddos: [ddoSchema],
  },
  { _id: false }
);

const ddosDataSchema = new mongoose.Schema(
  {
    district: {
      type: String,
      required: true,
    },
    ddoCount: {
      type: Number,
      required: true,
    },
    treasuries: [treasurySchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.DDOSData ||
  mongoose.model("DDOSData", ddosDataSchema);