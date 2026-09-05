import { addProject, getProjectById, getProjects } from './server/db.js';
import { executeIdempotentProjectOperation, findExistingProjectForCreation } from './app.js';
import { getAllCouponsAsync } from './server/coupons.js';
import { getSupabase } from './server/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = getSupabase();

async function runFullRaceMatrix() {
  console.log("==================================================");
  console.log("CODEFUSER - 14-POINT FORENSIC RACE CONDITION MATRIX");
  console.log("==================================================\n");

  const ts = Date.now();
  let totalPassed = 0;
  let totalFailed = 0;

  function reportResult(testNum: number, name: string, passed: boolean, details: string, stats: { requests: number, success: number, uniqueIds: number, rowsBefore: number, rowsAfter: number, netRows: number }) {
    if (passed) {
      totalPassed++;
      console.log(`✅ PASS | Test ${testNum}: ${name}`);
    } else {
      totalFailed++;
      console.error(`❌ FAIL | Test ${testNum}: ${name}`);
    }
    console.log(`   Details: ${details}`);
    console.log(`   Stats: Requests=${stats.requests}, Success=${stats.success}, UniqueIDs=${stats.uniqueIds}, DB Rows Before=${stats.rowsBefore}, DB Rows After=${stats.rowsAfter}, Net Rows=${stats.netRows}\n`);
  }

  // Helper to count DB rows for email
  async function countDbRows(email: string): Promise<number> {
    const { data } = await supabase.from('projects').select('id').eq('email', email);
    return data?.length || 0;
  }

  // --------------------------------------------------
  // TEST 1: Single submission
  // --------------------------------------------------
  {
    const email = `test1_${ts}@codefuser.test`;
    const key = `key_test1_${ts}`;
    const rowsBefore = await countDbRows(email);

    const res = await executeIdempotentProjectOperation(key, async () => {
      const existing = await findExistingProjectForCreation({ idempotencyKey: key, isNewProject: true, email });
      if (existing) return existing;
      return await addProject({
        clientName: "Test 1 Single",
        businessName: "Biz 1",
        email,
        whatsapp: "+91 9999900001",
        selectedPackage: "growth",
        ownershipChoice: "subscription",
        idempotencyKey: key
      });
    });

    const rowsAfter = await countDbRows(email);
    const netRows = rowsAfter - rowsBefore;
    const passed = !!res?.id && netRows === 1;

    reportResult(1, "Single Submission", passed, `Returned ID: ${res?.id}`, {
      requests: 1, success: 1, uniqueIds: 1, rowsBefore, rowsAfter, netRows
    });
  }

  // --------------------------------------------------
  // TEST 2: Rapid double-click
  // --------------------------------------------------
  {
    const email = `test2_${ts}@codefuser.test`;
    const key = `key_test2_${ts}`;
    const rowsBefore = await countDbRows(email);

    const runCall = () => executeIdempotentProjectOperation(key, async () => {
      const existing = await findExistingProjectForCreation({ idempotencyKey: key, isNewProject: true, email });
      if (existing) return existing;
      return await addProject({
        clientName: "Test 2 Double",
        businessName: "Biz 2",
        email,
        whatsapp: "+91 9999900002",
        selectedPackage: "growth",
        ownershipChoice: "subscription",
        idempotencyKey: key
      });
    });

    const [resA, resB] = await Promise.all([runCall(), runCall()]);
    const rowsAfter = await countDbRows(email);
    const netRows = rowsAfter - rowsBefore;
    const uniqueIds = new Set([resA?.id, resB?.id]).size;
    const passed = resA?.id === resB?.id && netRows === 1;

    reportResult(2, "Rapid Double-Click", passed, `ResA ID: ${resA?.id}, ResB ID: ${resB?.id}`, {
      requests: 2, success: 2, uniqueIds, rowsBefore, rowsAfter, netRows
    });
  }

  // --------------------------------------------------
  // TEST 3: 10 simultaneous identical submissions
  // --------------------------------------------------
  {
    const email = `test3_${ts}@codefuser.test`;
    const key = `key_test3_${ts}`;
    const rowsBefore = await countDbRows(email);

    const runCall = () => executeIdempotentProjectOperation(key, async () => {
      const existing = await findExistingProjectForCreation({ idempotencyKey: key, isNewProject: true, email });
      if (existing) return existing;
      return await addProject({
        clientName: "Test 3 Concur10",
        businessName: "Biz 3",
        email,
        whatsapp: "+91 9999900003",
        selectedPackage: "growth",
        ownershipChoice: "subscription",
        idempotencyKey: key
      });
    });

    const results = await Promise.all(Array.from({ length: 10 }).map(() => runCall()));
    const rowsAfter = await countDbRows(email);
    const netRows = rowsAfter - rowsBefore;
    const uniqueIds = new Set(results.map(r => r?.id)).size;
    const passed = uniqueIds === 1 && netRows === 1;

    reportResult(3, "10 Simultaneous Identical Submissions", passed, `Unique IDs: ${uniqueIds}`, {
      requests: 10, success: results.length, uniqueIds, rowsBefore, rowsAfter, netRows
    });
  }

  // --------------------------------------------------
  // TEST 4: 25+ simultaneous identical submissions
  // --------------------------------------------------
  {
    const email = `test4_${ts}@codefuser.test`;
    const key = `key_test4_${ts}`;
    const rowsBefore = await countDbRows(email);

    const runCall = () => executeIdempotentProjectOperation(key, async () => {
      const existing = await findExistingProjectForCreation({ idempotencyKey: key, isNewProject: true, email });
      if (existing) return existing;
      return await addProject({
        clientName: "Test 4 Concur25",
        businessName: "Biz 4",
        email,
        whatsapp: "+91 9999900004",
        selectedPackage: "growth",
        ownershipChoice: "subscription",
        idempotencyKey: key
      });
    });

    const results = await Promise.all(Array.from({ length: 25 }).map(() => runCall()));
    const rowsAfter = await countDbRows(email);
    const netRows = rowsAfter - rowsBefore;
    const uniqueIds = new Set(results.map(r => r?.id)).size;
    const passed = uniqueIds === 1 && netRows === 1;

    reportResult(4, "25+ Simultaneous Identical Submissions", passed, `Unique IDs: ${uniqueIds}`, {
      requests: 25, success: results.length, uniqueIds, rowsBefore, rowsAfter, netRows
    });
  }

  // --------------------------------------------------
  // TEST 5: Save-draft + final-submit race
  // --------------------------------------------------
  {
    const email = `test5_${ts}@codefuser.test`;
    const key = `key_test5_${ts}`;
    const rowsBefore = await countDbRows(email);

    const saveDraftCall = () => executeIdempotentProjectOperation(key, async () => {
      const existing = await findExistingProjectForCreation({ idempotencyKey: key, draftSessionId: key, isNewProject: true, email });
      if (existing) return existing;
      return await addProject({
        clientName: "Test 5 Draft",
        businessName: "Biz 5 Draft",
        email,
        whatsapp: "+91 9999900005",
        status: "draft",
        idempotencyKey: key
      });
    });

    const submitCall = () => executeIdempotentProjectOperation(key, async () => {
      const existing = await findExistingProjectForCreation({ idempotencyKey: key, draftSessionId: key, isNewProject: true, email });
      if (existing) return existing;
      return await addProject({
        clientName: "Test 5 Final",
        businessName: "Biz 5 Final",
        email,
        whatsapp: "+91 9999900005",
        status: "Assets Pending",
        idempotencyKey: key
      });
    });

    const [draftRes, submitRes] = await Promise.all([saveDraftCall(), submitCall()]);
    const rowsAfter = await countDbRows(email);
    const netRows = rowsAfter - rowsBefore;
    const uniqueIds = new Set([draftRes?.id, submitRes?.id]).size;
    const passed = uniqueIds === 1 && netRows === 1;

    reportResult(5, "Save-Draft + Final-Submit Race", passed, `Draft ID: ${draftRes?.id}, Submit ID: ${submitRes?.id}`, {
      requests: 2, success: 2, uniqueIds, rowsBefore, rowsAfter, netRows
    });
  }

  // --------------------------------------------------
  // TEST 6: Retry after successful response
  // --------------------------------------------------
  {
    const email = `test6_${ts}@codefuser.test`;
    const key = `key_test6_${ts}`;
    const rowsBefore = await countDbRows(email);

    const runCall = () => executeIdempotentProjectOperation(key, async () => {
      const existing = await findExistingProjectForCreation({ idempotencyKey: key, isNewProject: true, email });
      if (existing) return existing;
      return await addProject({
        clientName: "Test 6 Initial",
        businessName: "Biz 6 Initial",
        email,
        whatsapp: "+91 9999900006",
        idempotencyKey: key
      });
    });

    const firstRes = await runCall();
    const retryRes = await runCall();

    const rowsAfter = await countDbRows(email);
    const netRows = rowsAfter - rowsBefore;
    const uniqueIds = new Set([firstRes?.id, retryRes?.id]).size;
    const passed = uniqueIds === 1 && netRows === 1;

    reportResult(6, "Retry After Successful Response", passed, `First ID: ${firstRes?.id}, Retry ID: ${retryRes?.id}`, {
      requests: 2, success: 2, uniqueIds, rowsBefore, rowsAfter, netRows
    });
  }

  // --------------------------------------------------
  // TEST 7: Retry after simulated network ambiguity
  // --------------------------------------------------
  {
    const email = `test7_${ts}@codefuser.test`;
    const key = `key_test7_${ts}`;
    const rowsBefore = await countDbRows(email);

    // Initial request succeeds
    const firstRes = await addProject({
      clientName: "Test 7 Ambiguity",
      businessName: "Biz 7",
      email,
      whatsapp: "+91 9999900007",
      idempotencyKey: key
    });

    // Client didn't receive ACK, re-sends identical payload with key
    const retryRes = await executeIdempotentProjectOperation(key, async () => {
      const existing = await findExistingProjectForCreation({ idempotencyKey: key, isNewProject: true, email });
      if (existing) return existing;
      return await addProject({
        clientName: "Test 7 Ambiguity Retry",
        businessName: "Biz 7",
        email,
        whatsapp: "+91 9999900007",
        idempotencyKey: key
      });
    });

    const rowsAfter = await countDbRows(email);
    const netRows = rowsAfter - rowsBefore;
    const uniqueIds = new Set([firstRes?.id, retryRes?.id]).size;
    const passed = uniqueIds === 1 && netRows === 1;

    reportResult(7, "Retry After Simulated Network Ambiguity", passed, `First ID: ${firstRes?.id}, Retry ID: ${retryRes?.id}`, {
      requests: 2, success: 2, uniqueIds, rowsBefore, rowsAfter, netRows
    });
  }

  // --------------------------------------------------
  // TEST 8: Separate legitimate project
  // --------------------------------------------------
  {
    const email = `test8_${ts}@codefuser.test`;
    const keyA = `key_test8_A_${ts}`;
    const keyB = `key_test8_B_${ts}`;
    const rowsBefore = await countDbRows(email);

    const projA = await addProject({
      clientName: "Repeat Customer",
      businessName: "First Business",
      email,
      whatsapp: "+91 9999900008",
      idempotencyKey: keyA
    });

    const projB = await addProject({
      clientName: "Repeat Customer",
      businessName: "Second Separate Business",
      email,
      whatsapp: "+91 9999900008",
      idempotencyKey: keyB
    });

    const rowsAfter = await countDbRows(email);
    const netRows = rowsAfter - rowsBefore;
    const uniqueIds = new Set([projA?.id, projB?.id]).size;
    const passed = uniqueIds === 2 && netRows === 2 && projA.id !== projB.id;

    reportResult(8, "Separate Legitimate Projects (Same Customer)", passed, `Proj A ID: ${projA?.id}, Proj B ID: ${projB?.id}`, {
      requests: 2, success: 2, uniqueIds, rowsBefore, rowsAfter, netRows
    });
  }

  // --------------------------------------------------
  // TEST 9: Cross-process simulation (Multi-instance DB concurrency)
  // --------------------------------------------------
  {
    const email = `test9_${ts}@codefuser.test`;
    const key = `key_test9_multiinst_${ts}`;
    const rowsBefore = await countDbRows(email);

    // Bypass in-memory Map by calling addProject directly concurrently
    const promises = Array.from({ length: 10 }).map((_, idx) =>
      addProject({
        clientName: `Multi-Instance Client ${idx}`,
        businessName: "Biz 9 Multi",
        email,
        whatsapp: "+91 9999900009",
        idempotencyKey: key
      })
    );

    const results = await Promise.all(promises);
    const rowsAfter = await countDbRows(email);
    const netRows = rowsAfter - rowsBefore;
    const uniqueIds = new Set(results.map(r => r?.id)).size;
    const passed = uniqueIds === 1 && netRows === 1;

    reportResult(9, "Cross-Process Simulation (Multi-Instance DB Concurrency)", passed, `Unique Returned IDs: ${uniqueIds}`, {
      requests: 10, success: results.length, uniqueIds, rowsBefore, rowsAfter, netRows
    });
  }

  // --------------------------------------------------
  // TEST 10: Concurrent different creation keys
  // --------------------------------------------------
  {
    const email = `test10_${ts}@codefuser.test`;
    const key1 = `key_test10_1_${ts}`;
    const key2 = `key_test10_2_${ts}`;
    const key3 = `key_test10_3_${ts}`;
    const rowsBefore = await countDbRows(email);

    const [res1, res2, res3] = await Promise.all([
      addProject({ clientName: "Client 10", businessName: "Biz 10-1", email, whatsapp: "+91 9999900010", idempotencyKey: key1 }),
      addProject({ clientName: "Client 10", businessName: "Biz 10-2", email, whatsapp: "+91 9999900010", idempotencyKey: key2 }),
      addProject({ clientName: "Client 10", businessName: "Biz 10-3", email, whatsapp: "+91 9999900010", idempotencyKey: key3 })
    ]);

    const rowsAfter = await countDbRows(email);
    const netRows = rowsAfter - rowsBefore;
    const uniqueIds = new Set([res1?.id, res2?.id, res3?.id]).size;
    const passed = uniqueIds === 3 && netRows === 3;

    reportResult(10, "Concurrent Different Creation Keys", passed, `Unique Returned IDs: ${uniqueIds}`, {
      requests: 3, success: 3, uniqueIds, rowsBefore, rowsAfter, netRows
    });
  }

  // --------------------------------------------------
  // TEST 11: Different customers, same timing
  // --------------------------------------------------
  {
    const promises = Array.from({ length: 5 }).map((_, idx) => {
      const email = `test11_cust${idx}_${ts}@codefuser.test`;
      const key = `key_test11_cust${idx}_${ts}`;
      return addProject({
        clientName: `Customer ${idx}`,
        businessName: `Biz Cust ${idx}`,
        email,
        whatsapp: `+91 999991110${idx}`,
        idempotencyKey: key
      });
    });

    const results = await Promise.all(promises);
    const uniqueIds = new Set(results.map(r => r?.id)).size;
    const passed = uniqueIds === 5;

    reportResult(11, "Different Customers, Same Timing", passed, `Unique Returned IDs: ${uniqueIds}`, {
      requests: 5, success: 5, uniqueIds, rowsBefore: 0, rowsAfter: 5, netRows: 5
    });
  }

  // --------------------------------------------------
  // TEST 12: Coupon regression
  // --------------------------------------------------
  {
    const coupons = await getAllCouponsAsync();
    const passed = Array.isArray(coupons);

    reportResult(12, "Coupon System Regression Check", passed, `Coupons retrieved: ${coupons?.length ?? 0}`, {
      requests: 1, success: 1, uniqueIds: 1, rowsBefore: coupons?.length ?? 0, rowsAfter: coupons?.length ?? 0, netRows: 0
    });
  }

  // --------------------------------------------------
  // TEST 13: FULLWAIVER regression
  // --------------------------------------------------
  {
    const email = `test13_waiver_${ts}@codefuser.test`;
    const key = `key_test13_waiver_${ts}`;
    const rowsBefore = await countDbRows(email);

    const waiverProj = await addProject({
      clientName: "Waiver Client",
      businessName: "Waiver Biz",
      email,
      whatsapp: "+91 9999900013",
      paymentStatus: "paid",
      paymentProvider: "coupon_waiver",
      idempotencyKey: key
    });

    const rowsAfter = await countDbRows(email);
    const netRows = rowsAfter - rowsBefore;
    const passed = waiverProj?.paymentStatus === 'paid' && waiverProj?.payment?.provider === 'coupon_waiver' && netRows === 1;

    reportResult(13, "FULLWAIVER Coupon Regression Check", passed, `Project Payment Status: ${waiverProj?.paymentStatus}, Provider: ${waiverProj?.payment?.provider}`, {
      requests: 1, success: 1, uniqueIds: 1, rowsBefore, rowsAfter, netRows
    });
  }

  // --------------------------------------------------
  // TEST 14: Dashboard lookup
  // --------------------------------------------------
  {
    const email = `test14_lookup_${ts}@codefuser.test`;
    const key = `key_test14_lookup_${ts}`;
    const rowsBefore = await countDbRows(email);

    const created = await addProject({
      clientName: "Dashboard Lookup Client",
      businessName: "Dashboard Lookup Biz",
      email,
      whatsapp: "+91 9999900014",
      idempotencyKey: key
    });

    const fetched = await getProjectById(created.id);
    const rowsAfter = await countDbRows(email);
    const netRows = rowsAfter - rowsBefore;
    const passed = fetched?.id === created.id && netRows === 1;

    reportResult(14, "Dashboard Lookup Verification", passed, `Created ID: ${created.id}, Fetched ID: ${fetched?.id}`, {
      requests: 1, success: 1, uniqueIds: 1, rowsBefore, rowsAfter, netRows
    });
  }

  console.log("==================================================");
  console.log(`FINAL RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED out of 14 tests.`);
  console.log("==================================================");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runFullRaceMatrix().catch(err => {
  console.error("Race matrix error:", err);
  process.exit(1);
});
