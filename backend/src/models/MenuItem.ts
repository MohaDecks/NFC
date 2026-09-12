import { Schema, model } from "mongoose";

const menuItemSchema = new Schema(
  {
    profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "MenuCategory", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "ETB", maxlength: 8 },
    image: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    available: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

menuItemSchema.index({ category: 1, sortOrder: 1 });

export const MenuItem = model("MenuItem", menuItemSchema);
