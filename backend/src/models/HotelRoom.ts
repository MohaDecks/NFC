import { Schema, model } from "mongoose";

const hotelRoomSchema = new Schema(
  {
    profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    roomType: { type: String, enum: ["single", "double", "twin", "deluxe", "suite", "family"], default: "double" },
    description: { type: String, default: "", maxlength: 500 },
    price: { type: Number, default: 0 },
    currency: { type: String, default: "ETB" },
    capacity: { type: Number, default: 2 },
    beds: { type: Number, default: 1 },
    amenities: { type: [String], default: [] },
    images: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    available: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

hotelRoomSchema.index({ profile: 1, sortOrder: 1 });

export const HotelRoom = model("HotelRoom", hotelRoomSchema);
