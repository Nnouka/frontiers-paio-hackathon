import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (getApps().length === 0) {
  initializeApp({ projectId: "frontiers-paio-dev" });
}
const auth = getAuth();

interface SeedPharmacyUser {
  email: string;
  password: string;
  pharmacyId: string;
}

const SEED_PHARMACY_USERS: SeedPharmacyUser[] = [
  { email: "pharmacy1@demo.pharmaloop.app", password: "Demo1234!", pharmacyId: "pharm-001" },
  { email: "pharmacy2@demo.pharmaloop.app", password: "Demo1234!", pharmacyId: "pharm-002" },
];

async function seedUsers() {
  for (const seedUser of SEED_PHARMACY_USERS) {
    let user;
    try {
      user = await auth.getUserByEmail(seedUser.email);
    } catch {
      user = await auth.createUser({
        email: seedUser.email,
        password: seedUser.password,
        emailVerified: true,
      });
    }

    await auth.setCustomUserClaims(user.uid, { role: "pharmacy", pharmacyId: seedUser.pharmacyId });
    console.log(`Seeded pharmacy user ${seedUser.email} -> pharmacyId=${seedUser.pharmacyId}`);
  }

  console.log("Pharmacy user seed complete.");
}

seedUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Pharmacy user seed failed:", err);
    process.exit(1);
  });
