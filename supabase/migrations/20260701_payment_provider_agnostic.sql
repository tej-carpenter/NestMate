-- Rename razorpay_transaction_id to provider_transaction_id for provider-agnostic payments
ALTER TABLE transactions RENAME COLUMN razorpay_transaction_id TO provider_transaction_id;
