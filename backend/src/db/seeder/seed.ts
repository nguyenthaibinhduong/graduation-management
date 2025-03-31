
import { MainSeeder } from './main.seeder';

async function main() {
  await MainSeeder.seed();
  console.log('All seeding completed!');
  process.exit();
}

main();
