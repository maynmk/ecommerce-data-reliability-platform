with source as (
    select * from {{ source('bronze', 'order_items') }}
),

renamed as (
    select
        order_id,
        nullif(order_item_id, '')::int as order_item_id,
        product_id,
        seller_id,
        nullif(shipping_limit_date, '')::timestamp as shipping_limit_at,
        nullif(price, '')::numeric(18, 2) as item_price,
        nullif(freight_value, '')::numeric(18, 2) as freight_value,
        ingestion_run_id as _ingestion_run_id,
        source_file as _source_file,
        ingested_at as _ingested_at
    from source
)

select * from renamed
