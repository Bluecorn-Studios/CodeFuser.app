import { addProject, getProjectById } from './server/db.js';
import { getSupabase } from './server/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = getSupabase();

async function testMultiInstanceDbConcurrency() {
  console.log("==================================================");
  console.log("TESTING DB-LEVEL MULTI-INSTANCE CONCURRENCY");
  console.log("==================================================\n");

  const testKey = `multi_inst_${Date.now()}`;
  const testEmail = `multi_inst_${Date.now()}@codefuser.test`;

  const payload = {
    clientName: "Multi-Instance Client",
    businessName: "Multi-Instance Biz",
    email: testEmail,
    whatsapp: "+91 9999900000",
    selectedPackage: "growth",
    ownershipChoice: "managed",
    idempotencyKey: testKey
  };

  // Simulate 10 independent instances hitting addProject DIRECTLY (bypassing in-memory Map)
  console.log("Simulating 10 independent processes calling addProject concurrently...");
  const promises = Array.from({ length: 10 }).map((_, idx) => 
    addProject({ ...payload, clientName: `Multi-Instance Client Process ${idx}` })
  );

  const results = await Promise.all(promises);

  const returnedIds = results.map(r => r.id);
  const uniqueReturnedIds = new Set(returnedIds);

  // Check actual DB rows in Supabase
  const { data: dbRows } = await supabase.from('projects').select('id, client_name').eq('email', testEmail);

  console.log("--------------------------------------------------");
  console.log(`Total concurrent calls: 10`);
  console.log(`Successful returned IDs: ${returnedIds.length}`);
  console.log(`Unique returned IDs: ${uniqueReturnedIds.size} (${Array.from(uniqueReturnedIds)[0]})`);
  console.log(`Actual DB rows in Supabase: ${dbRows?.length}`);
  console.log("--------------------------------------------------");

  if (uniqueReturnedIds.size === 1 && dbRows?.length === 1) {
    console.log("✅ MULTI-INSTANCE DB CONCURRENCY PASSED PERFECTLY!");
  } else {
    console.error("❌ MULTI-INSTANCE DB CONCURRENCY FAILED!");
    process.exit(1);
  }
}

testMultiInstanceDbConcurrency().catch(err => {
  console.error("Multi-instance test error:", err);
  process.exit(1);
});
