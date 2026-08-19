import mongoose from "mongoose";
import { User } from "../src/models/User";

const email = process.argv[2]?.toLowerCase().trim();

async function main() {
  if (!email) {
    console.error("Usage: MONGODB_URI=... npx tsx scripts/set-admin.ts <email>");
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const user = await User.findOneAndUpdate(
    { email },
    { isAdmin: true },
    { new: true }
  );

  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  console.log(`✓ ${email} is now admin (${user.name})`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
