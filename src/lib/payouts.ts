/**
 * Utility for calculating payouts for a host.
 */

// We assume 10% platform commission as per requirements.
const PLATFORM_COMMISSION_RATE = 0.10;

/**
 * Calculates the total next payout amount for a host.
 * Only confirmed bookings with completed payments are considered.
 * 
 * @param bookings Array of booking records with rent_amount
 * @returns The total amount payable to the host after commission.
 */
export function calculateHostPayout(bookings: Array<{ rent_amount: number; booking_status: string; payment_status: string }>): number {
  if (!bookings || bookings.length === 0) return 0;
  
  const eligibleBookings = bookings.filter(
    (b) => b.booking_status === "confirmed" && (b.payment_status === "paid" || b.payment_status === "completed")
  );

  const grossTotal = eligibleBookings.reduce((sum, b) => sum + (b.rent_amount || 0), 0);
  
  const netTotal = grossTotal * (1 - PLATFORM_COMMISSION_RATE);
  
  return netTotal;
}
