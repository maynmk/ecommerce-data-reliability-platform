{{ config(materialized='table') }}

with order_items as (
    select
        order_id,
        order_item_id,
        product_id,
        seller_id,
        shipping_limit_at as shipping_limit_date,
        item_price as price,
        freight_value,
        (
            coalesce(item_price, 0)::numeric(18, 2)
            + coalesce(freight_value, 0)::numeric(18, 2)
        )::numeric(18, 2) as item_total_value
    from {{ ref('stg_order_items') }}
)

select * from order_items
