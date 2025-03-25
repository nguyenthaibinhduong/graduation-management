import { StudentSeeder } from './student.seeder';
import { UserSeeder } from './user.seeder';

async function main() {
  await UserSeeder.seed();
  // await StudentSeeder.seed();
  console.log('All seeding completed!');
  process.exit();
}

main();
