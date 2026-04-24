with source as (
    select * from {{ source('bronze', 'orders') }}
),

renamed as (
    select
        order_id,
        customer_id,
        order_status,
        nullif(order_purchase_timestamp, '')::timestamp as purchased_at,
        nullif(order_approved_at, '')::timestamp as approved_at,
        nullif(order_delivered_carrier_date, '')::timestamp as delivered_carrier_at,
        nullif(order_delivered_customer_date, '')::timestamp as delivered_customer_at,
        nullif(order_estimated_delivery_date, '')::date as estimated_delivery_date,
        ingestion_run_id as _ingestion_run_id,
        source_file as _source_file,
        ingested_at as _ingested_at
    from source
)

select * from renamed
