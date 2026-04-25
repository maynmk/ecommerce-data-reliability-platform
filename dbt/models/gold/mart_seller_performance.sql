{{ config(materialized='table') }}

with seller_order_items as (
    -- One row per (seller, order) to avoid duplicating order-level attributes (like reviews).
    select
        seller_id,
        order_id,
        count(*) as total_items_sold,
        sum(price)::numeric(18, 2) as total_revenue,
        sum(freight_value)::numeric(18, 2) as total_freight
    from {{ ref('fct_order_items') }}
    group by 1, 2
),

orders as (
    select
        order_id,
        is_delivered,
        is_late_delivery
    from {{ ref('fct_orders') }}
),

order_reviews as (
    select
        order_id,
        avg(review_score::numeric) as review_score
    from {{ ref('fct_reviews') }}
    group by 1
),

sellers as (
    select
        seller_id,
        seller_state
    from {{ ref('dim_sellers') }}
),

seller_orders as (
    select
        soi.seller_id,
        s.seller_state,
        soi.order_id,
        soi.total_items_sold,
        soi.total_revenue,
        soi.total_freight,
        o.is_delivered,
        o.is_late_delivery,
        r.review_score
    from seller_order_items soi
    inner join orders o
        on soi.order_id = o.order_id
    inner join sellers s
        on soi.seller_id = s.seller_id
    left join order_reviews r
        on soi.order_id = r.order_id
),

final as (
    select
        seller_id,
        seller_state,
        count(distinct order_id) as total_orders,
        sum(total_items_sold) as total_items_sold,
        sum(total_revenue)::numeric(18, 2) as total_revenue,
        sum(total_freight)::numeric(18, 2) as total_freight,
        (sum(total_revenue) / nullif(sum(total_items_sold), 0))::numeric(18, 2) as avg_item_price,
        avg(review_score)::numeric(18, 2) as avg_review_score,
        case
            when count(distinct case when is_delivered then order_id end) = 0 then null
            else (
                count(distinct case when is_late_delivery then order_id end)::numeric
                / count(distinct case when is_delivered then order_id end)
            )::numeric(18, 4)
        end as late_delivery_rate
    from seller_orders
    group by 1, 2
)

select * from final
