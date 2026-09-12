import { Schema, model } from "mongoose";

const menuCategorySchema = new Schema(
  {
    profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, default: "", maxlength: 200 },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

menuCategorySchema.index({ profile: 1, sortOrder: 1 });

export const MenuCategory = model("MenuCategory", menuCategorySchema);
