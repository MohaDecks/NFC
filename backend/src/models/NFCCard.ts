import { Schema, model } from "mongoose";

const nfcCardSchema = new Schema(
  {
    cardId: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "Primary Card", trim: true, maxlength: 80 },
    profileId: { type: Schema.Types.ObjectId, ref: "Profile", required: true, index: true },
    publicUrl: { type: String, required: true },
    designId: { type: Schema.Types.ObjectId, ref: "CardDesign", default: null },
    status: { type: String, enum: ["ACTIVE", "INACTIVE", "LOST", "REPLACED"], default: "ACTIVE", index: true },
    nfcEnabled: { type: Boolean, default: true },
    qrEnabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const NFCCard = model("NFCCard", nfcCardSchema);
