## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `phone` | `varchar` |  Nullable Unique |
| `name` | `varchar` |  Nullable |
| `email` | `varchar` |  Nullable Unique |
| `role` | `varchar` |  Nullable |
| `aadhaar_verified` | `bool` |  Nullable |
| `avatar_url` | `text` |  Nullable |
| `profile_bio` | `text` |  Nullable |
| `verification_status` | `varchar` |  Nullable |
| `wallet_balance` | `numeric` |  Nullable |
| `total_bookings` | `int4` |  Nullable |
| `total_hosted_listings` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `listings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `host_id` | `uuid` |  |
| `title` | `varchar` |  |
| `description` | `text` |  Nullable |
| `city` | `varchar` |  |
| `locality` | `varchar` |  |
| `address` | `text` |  Nullable |
| `latitude` | `numeric` |  Nullable |
| `longitude` | `numeric` |  Nullable |
| `space_type` | `varchar` |  |
| `price` | `numeric` |  |
| `price_type` | `varchar` |  |
| `amenities` | `_text` |  Nullable |
| `gender_preference` | `varchar` |  Nullable |
| `images` | `_text` |  Nullable |
| `status` | `varchar` |  Nullable |
| `views_count` | `int4` |  Nullable |
| `nestscore` | `numeric` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `bookings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `listing_id` | `uuid` |  |
| `guest_id` | `uuid` |  |
| `host_id` | `uuid` |  |
| `move_in_date` | `date` |  |
| `move_out_date` | `date` |  Nullable |
| `rent_amount` | `numeric` |  |
| `deposit_amount` | `numeric` |  Nullable |
| `booking_status` | `varchar` |  Nullable |
| `payment_status` | `varchar` |  Nullable |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `transactions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `booking_id` | `uuid` |  Nullable |
| `amount` | `numeric` |  |
| `transaction_type` | `varchar` |  |
| `payment_method` | `varchar` |  Nullable |
| `payment_status` | `varchar` |  Nullable |
| `razorpay_transaction_id` | `varchar` |  Nullable |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `chats`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `listing_id` | `uuid` |  |
| `guest_id` | `uuid` |  |
| `host_id` | `uuid` |  |
| `last_message_at` | `timestamptz` |  Nullable |
| `guest_last_read_at` | `timestamptz` |  Nullable |
| `host_last_read_at` | `timestamptz` |  Nullable |
| `status` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `messages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `chat_id` | `uuid` |  |
| `sender_id` | `uuid` |  |
| `body` | `text` |  |
| `is_read` | `bool` |  Nullable |
| `read_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `reviews`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `listing_id` | `uuid` |  |
| `guest_id` | `uuid` |  |
| `booking_id` | `uuid` |  Nullable |
| `safety_score` | `int4` |  Nullable |
| `cleanliness_score` | `int4` |  Nullable |
| `connectivity_score` | `int4` |  Nullable |
| `value_score` | `int4` |  Nullable |
| `food_score` | `int4` |  Nullable |
| `overall_score` | `numeric` |  Nullable |
| `review_text` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `nestscores`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `listing_id` | `uuid` |  Unique |
| `avg_safety` | `numeric` |  Nullable |
| `avg_cleanliness` | `numeric` |  Nullable |
| `avg_connectivity` | `numeric` |  Nullable |
| `avg_value` | `numeric` |  Nullable |
| `avg_food` | `numeric` |  Nullable |
| `avg_overall` | `numeric` |  Nullable |
| `total_reviews` | `int4` |  Nullable |
| `verified_reviews` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `archived_properties`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `original_property_id` | `uuid` |  |
| `owner_id` | `uuid` |  |
| `owner_phone` | `text` |  |
| `owner_name` | `text` |  |
| `title` | `text` |  |
| `description` | `text` |  |
| `location` | `text` |  |
| `pricing` | `jsonb` |  |
| `property_type` | `text` |  |
| `status` | `text` |  |
| `archived_reason` | `archived_property_reason` |  |
| `archived_by` | `uuid` |  |
| `archived_at` | `timestamptz` |  |
| `original_created_at` | `timestamptz` |  |
| `restored_by` | `uuid` |  Nullable |
| `restored_at` | `timestamptz` |  Nullable |
| `listing_snapshot` | `jsonb` |  |

