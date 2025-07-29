// Test manual entries functionality
// Run this in browser console on the NewEstimate page

console.log("🧪 Testing Manual Entries System...");

// Test 1: Check if manual entries functions exist
const testFunctions = [
  'addManualEntry',
  'updateManualEntry', 
  'removeManualEntry',
  'calculateTotals'
];

testFunctions.forEach(fn => {
  if (typeof window[fn] === 'function') {
    console.log(`✅ ${fn} function available`);
  } else {
    console.log(`❌ ${fn} function not found`);
  }
});

// Test 2: Simulate adding manual entries
console.log("📝 Simulating manual entry addition...");

// This would be called by clicking "Add Item"
const mockManualEntries = [
  { description: "Extra waterproofing membrane", qty: 500, unit: "sq ft", cost: 2.50 },
  { description: "Additional labor", qty: 8, unit: "hours", cost: 85.00 }
];

const mockTotals = {
  manualTotal: mockManualEntries.reduce((sum, entry) => sum + (entry.qty * entry.cost), 0),
  aiTotal: 15000, // From AI analysis
  grandTotal: 0
};
mockTotals.grandTotal = mockTotals.manualTotal + mockTotals.aiTotal;

console.log("💰 Mock totals calculation:", mockTotals);
console.log(`Manual: $${mockTotals.manualTotal.toFixed(2)}`);
console.log(`AI: $${mockTotals.aiTotal.toFixed(2)}`);
console.log(`Grand Total: $${mockTotals.grandTotal.toFixed(2)}`);

console.log("✅ Manual entries test complete!");
