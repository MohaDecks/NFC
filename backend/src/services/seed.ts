import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { Admin } from "../models/Admin";
import { Profile } from "../models/Profile";
import { Role } from "../models/Role";
import { ROLE_PRESETS } from "../../../shared/permissions";
import { County } from "../models/County";
import { City } from "../models/City";
import { getOrCreateBranding } from "../controllers/brandingController";
import { seedProfileTypes } from "../controllers/profileTypeController";
import { seedCardDesigns } from "../controllers/cardDesignController";

export async function seedRolesAndAdmin() {
  for (const preset of ROLE_PRESETS) {
    await Role.findOneAndUpdate(
      { slug: preset.slug },
      {
        name: preset.name,
        slug: preset.slug,
        description: preset.description,
        permissions: preset.permissions,
        status: "ACTIVE",
        system: true,
      },
      { upsert: true, returnDocument: "after" },
    );
  }

  const superRole = await Role.findOne({ slug: "super_admin" });
  let admin = await Admin.findOne({ email: env.ADMIN_EMAIL });
  if (!admin) {
    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
    admin = await Admin.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      passwordHash,
      roleId: superRole?._id,
      status: "ACTIVE",
    });
    console.log(`Seeded admin ${env.ADMIN_EMAIL}`);
  } else if (superRole && !admin.roleId) {
    admin.roleId = superRole._id;
    await admin.save();
  }

  await Admin.updateMany({ roleId: null, status: { $exists: false } }, { $set: { status: "ACTIVE" } });
  if (superRole) {
    await Admin.updateMany({ roleId: null }, { $set: { roleId: superRole._id, status: "ACTIVE" } });
  }

  await seedCountiesAndCities();
  await seedEthiopia();
  await seedProfileTypes();
  await seedCardDesigns();
  await getOrCreateBranding();
}

const BASIC_LOCATIONS: { county: string; cities: string[] }[] = [
  { county: "Banadir", cities: ["Mogadishu"] },
  { county: "Woqooyi Galbeed", cities: ["Hargeisa", "Berbera"] },
  { county: "Awdal", cities: ["Borama"] },
  { county: "Togdheer", cities: ["Burao"] },
  { county: "Bari", cities: ["Bosaso"] },
  { county: "Nugaal", cities: ["Garowe"] },
  { county: "Mudug", cities: ["Galkayo"] },
  { county: "Hiiraan", cities: ["Beledweyne"] },
  { county: "Bay", cities: ["Baidoa"] },
  { county: "Lower Juba", cities: ["Kismayo"] },
];

async function seedCountiesAndCities() {
  if ((await County.countDocuments()) > 0) return;
  for (const item of BASIC_LOCATIONS) {
    const county = await County.create({ name: item.county, status: "ACTIVE" });
    await City.insertMany(item.cities.map((name) => ({ name, countyId: county._id, status: "ACTIVE" })));
  }
  console.log("Seeded counties and cities");
}

async function seedEthiopia() {
  const existing = await County.findOne({ name: /^Ethiopia$/i });
  if (existing) {
    if (!existing.code) {
      existing.code = "ET";
      existing.isoCode = "ETH";
      existing.flag = "🇪🇹";
      await existing.save();
    }
    return;
  }
  const country = await County.create({
    name: "Ethiopia",
    code: "ET",
    isoCode: "ETH",
    flag: "🇪🇹",
    status: "ACTIVE",
  });
  await City.insertMany(
    ["Addis Ababa", "Dire Dawa", "Hawassa", "Bahir Dar", "Mekelle"].map((name) => ({
      name,
      countyId: country._id,
      status: "ACTIVE",
    })),
  );
}

export async function migrateLegacyProfiles() {
  try {
    await Profile.collection.dropIndex("owner_1");
    console.log("Dropped legacy unique owner index");
  } catch {
    // index may not exist
  }

  await Profile.collection.updateMany(
    { status: { $in: ["DRAFT", "UNPUBLISHED", "published", "unpublished"] } },
    { $set: { status: "INACTIVE" } },
  );
  await Profile.collection.updateMany({ status: "PUBLISHED" }, { $set: { status: "ACTIVE", publishState: "PUBLISHED" } });
  await Profile.collection.updateMany(
    { isVerified: { $exists: false } },
    { $set: { isVerified: false, verifiedAt: null, verifiedBy: null } },
  );
  await Profile.collection.updateMany(
    { "design.accentColor": { $in: [null, ""] } },
    { $set: { "design.accentColor": "#C9A227" } },
  );
  await Profile.collection.updateMany(
    { publishState: { $exists: false }, status: "ACTIVE" },
    { $set: { publishState: "PUBLISHED" } },
  );
  await Profile.collection.updateMany({ publishState: { $exists: false } }, { $set: { publishState: "DRAFT" } });

  const missingOwner = await Profile.collection
    .find({ $or: [{ ownerName: { $exists: false } }, { ownerName: "" }] })
    .toArray();
  for (const profile of missingOwner) {
    await Profile.collection.updateOne({ _id: profile._id }, { $set: { ownerName: profile.name ?? "" } });
  }
}
