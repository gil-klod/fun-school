import { seedGameContent } from "../src/lib/content/seed";

seedGameContent(true)
  .then((result) => {
    console.log(`Seeded ${result.inserted} content documents.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
