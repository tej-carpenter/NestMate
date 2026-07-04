const fs = require('fs');

function replaceInFile(filePath, search, replace) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(search, replace);
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. host bookings client
replaceInFile(
  'src/components/host/host-bookings-client.tsx',
  'supabase.from("users").select("id, full_name, phone, email, gender, age, government_id, address").in("id", guestIds)',
  '(supabase.from("users").select("id, full_name, phone, email, gender, age, government_id, address") as any).in("id", guestIds)'
);

// 2. profile panel
replaceInFile(
  'src/components/profile/profile-panel.tsx',
  ']).then(([{ data: user }, { count: bCount }, { count: pCount }]) => {',
  ']).then(([{ data: userRecord }, { count: bCount }, { count: pCount }]) => { const user = userRecord as any;'
);

// 3. listing-store
replaceInFile(
  'src/lib/database/listing-store.ts',
  'await supabase.from("listings").insert(listing).select().single()',
  'await (supabase.from("listings").insert(listing) as any).select().single()'
);

// 4. razorpay
replaceInFile(
  'src/lib/payments/providers/razorpay.ts',
  `    return {
      id: order.id,
      amount: order.amount as number,
      currency: order.currency,
      providerOrderId: order.id,
      provider: "razorpay",
      ...order,
    };`,
  `    return {
      ...order,
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      providerOrderId: order.id,
      provider: "razorpay",
    };`
);

console.log("Fixed part 2");
