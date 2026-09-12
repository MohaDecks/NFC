import { Schema, model } from "mongoose";

const hotelServiceSchema = new Schema(
  {
    profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: "", maxlength: 400 },
    icon: { type: String, default: "sparkles" },
    image: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

hotelServiceSchema.index({ profile: 1, sortOrder: 1 });

export const HotelService = model("HotelService", hotelServiceSchema);
