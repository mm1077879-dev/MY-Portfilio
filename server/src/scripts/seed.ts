import { connectDatabase, disconnectDatabase } from '../config/database';
import { ensureSeededDatabase } from '../services/seedService';

async function runSeed() {
  try {
    const force = process.argv.includes('--reset');
    await connectDatabase();
    await ensureSeededDatabase(force);
    console.log(`[Seed] Database seeding complete (reset=${force}).`);
  } catch (error) {
    console.error('[Seed] Failed to seed database:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
}

runSeed();
