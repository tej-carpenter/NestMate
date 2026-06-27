"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatRupee } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Home, Calendar, Users, IndianRupee } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";

export default function ReceiptPage({ params }: { params: Promise<{ bookingId: string }> | { bookingId: string } }) {
  const router = useRouter();
  const resolvedParams = use(params as Promise<{ bookingId: string }>);
  const { bookingId } = resolvedParams;

  const [booking, setBooking] = useState<any>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function fetchReceiptData() {
      try {
        const { data: bData, error: bError } = await (supabase as any)
          .from("bookings")
          .select(`
            *,
            listings:listing_id(title, address, city, locality, images),
            users:guest_id(full_name, email, phone)
          `)
          .eq("id", bookingId)
          .single();

        if (bError || !bData) {
          throw new Error("Booking not found");
        }

        const { data: tData, error: tError } = await (supabase as any)
          .from("transactions")
          .select("*")
          .eq("booking_id", bookingId)
          .eq("transaction_type", "payment")
          .single();

        setBooking(bData);
        if (tData) setTransaction(tData);
      } catch (err: any) {
        setError(err.message || "Failed to load receipt");
      } finally {
        setLoading(false);
      }
    }

    fetchReceiptData();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-[color:var(--muted)] animate-pulse">Loading receipt...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-semibold">{error || "Receipt not found"}</p>
        <Button onClick={() => router.push("/guest/bookings")}>Return to Bookings</Button>
      </div>
    );
  }

  const printReceipt = () => {
    window.print();
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hide controls when printing */}
      <div className="print:hidden mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/guest/bookings")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button onClick={printReceipt} className="gap-2">
          <Printer className="h-4 w-4" /> Print Receipt
        </Button>
      </div>

      <Card id="printable-receipt" className="overflow-hidden border border-[color:var(--border)] bg-white p-8 sm:p-12 text-black shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-600">NestMate</h1>
            <p className="text-sm text-gray-500 mt-1">Official Booking Receipt</p>
          </div>
          <div className="mt-4 sm:mt-0 text-left sm:text-right">
            <p className="font-semibold text-gray-900">Receipt #{transaction?.id?.substring(0, 8).toUpperCase() || booking.id.substring(0, 8).toUpperCase()}</p>
            <p className="text-sm text-gray-500">Date: {new Date(transaction?.created_at || booking.created_at).toLocaleDateString()}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              PAID IN FULL
            </span>
          </div>
        </div>

        {/* Guest & Listing Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Guest Information</h3>
            <p className="font-medium text-gray-900">{booking.users?.full_name || "Guest User"}</p>
            <p className="text-sm text-gray-600 mt-1">{booking.users?.email}</p>
            {booking.users?.phone && <p className="text-sm text-gray-600">{booking.users.phone}</p>}
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Property Details</h3>
            <div className="flex gap-4 items-start">
              {booking.listings?.images?.[0] && (
                <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0 hidden sm:block">
                  <SafeImage src={booking.listings.images[0]} fallbackSrc="" alt="Listing" fill className="object-cover" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{booking.listings?.title}</p>
                <p className="text-sm text-gray-600 mt-1 flex gap-1 items-start">
                  <Home className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>{booking.listings?.address || `${booking.listings?.locality}, ${booking.listings?.city}`}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Details Table */}
        <div className="mb-10 rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Description</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-6 py-4 flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" /> Check-in Date
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{new Date(booking.move_in_date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" /> Check-out Date
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{new Date(booking.move_out_date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" /> Guests
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{booking.guest_count} Guest{booking.guest_count > 1 ? 's' : ''} ({booking.quantity} Unit{booking.quantity > 1 ? 's' : ''})</td>
              </tr>
              {transaction?.razorpay_transaction_id && (
                <tr>
                  <td className="px-6 py-4 text-gray-600">Transaction ID</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-900">{transaction.razorpay_transaction_id}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end border-t border-gray-200 pt-6">
          <div className="w-full max-w-sm">
            <div className="flex justify-between py-2 text-gray-600">
              <span>Booking Amount</span>
              <span>{formatRupee(booking.rent_amount)}</span>
            </div>
            <div className="flex justify-between py-2 text-gray-600">
              <span>Security Deposit</span>
              <span>{formatRupee(booking.deposit_amount || 0)}</span>
            </div>
            <div className="flex justify-between py-4 text-xl font-bold text-gray-900 border-t border-gray-200 mt-2">
              <span>Total Paid</span>
              <span className="flex items-center gap-1">
                <IndianRupee className="h-5 w-5" />
                {booking.rent_amount + (booking.deposit_amount || 0)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-16 text-center text-xs text-gray-400">
          <p>This is a computer generated receipt and does not require a physical signature.</p>
          <p className="mt-1">Thank you for booking with NestMate.</p>
        </div>
      </Card>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
        }
      `}} />
    </main>
  );
}
