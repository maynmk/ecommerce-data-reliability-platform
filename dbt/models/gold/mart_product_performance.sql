{{ config(materialized='table') }}

with order_items as (
    select
        order_id,
        product_id,
        price,
        freight_value
    from {{ ref('fct_order_items') }}
),

products as (
    select
        product_id,
        product_category_name_english
    from {{ ref('dim_products') }}
),

category_orders as (
    -- One row per (category, order) so order-level attributes (like reviews) are not duplicated by item count.
    select
        coalesce(p.product_category_name_english, 'unknown') as product_category_name_english,
        oi.order_id,
        count(*) as total_items_sold,
        sum(oi.price)::numeric(18, 2) as total_revenue,
        sum(oi.freight_value)::numeric(18, 2) as total_freight
    from order_items oi
    left join products p
        on oi.product_id = p.product_id
    group by 1, 2
),

order_reviews as (
    select
        order_id,
        avg(review_score::numeric) as review_score
    from {{ ref('fct_reviews') }}
    group by 1
),

final as (
    select
        c.product_category_name_english,
        count(distinct c.order_id) as total_orders,
        sum(c.total_items_sold) as total_items_sold,
        sum(c.total_revenue)::numeric(18, 2) as total_revenue,
        (sum(c.total_revenue) / nullif(sum(c.total_items_sold), 0))::numeric(18, 2) as avg_item_price,
        (sum(c.total_freight) / nullif(sum(c.total_items_sold), 0))::numeric(18, 2) as avg_freight_value,
        avg(r.review_score)::numeric(18, 2) as avg_review_score
    from category_orders c
    left join order_reviews r
        on c.order_id = r.order_id
    group by 1
)

select * from final
