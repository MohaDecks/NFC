import { Schema, model } from "mongoose";

const citySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    countyId: { type: Schema.Types.ObjectId, ref: "County", required: true, index: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE", index: true },
  },
  { timestamps: true },
);

citySchema.index({ countyId: 1, name: 1 }, { unique: true });

export const City = model("City", citySchema);
