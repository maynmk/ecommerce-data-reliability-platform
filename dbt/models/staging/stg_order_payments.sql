with source as (
    select * from {{ source('bronze', 'order_payments') }}
),

renamed as (
    select
        order_id,
        nullif(payment_sequential, '')::int as payment_sequential,
        payment_type,
        nullif(payment_installments, '')::int as payment_installments,
        nullif(payment_value, '')::numeric(18, 2) as payment_value,
        ingestion_run_id as _ingestion_run_id,
        source_file as _source_file,
        ingested_at as _ingested_at
    from source
)

select * from renamed
