{{ config(materialized='table') }}

with orders as (
    select
        order_id,
        purchased_at::date as order_date,
        is_delivered,
        is_canceled
    from {{ ref('fct_orders') }}
    where purchased_at is not null
),

order_items as (
    select
        order_id,
        price,
        freight_value
    from {{ ref('fct_order_items') }}
),

order_reviews as (
    select
        order_id,
        avg(review_score::numeric) as average_review_score
    from {{ ref('fct_reviews') }}
    group by 1
),

orders_agg as (
    select
        order_date,
        count(distinct order_id) as total_orders,
        count(distinct case when is_delivered then order_id end) as delivered_orders,
        count(distinct case when is_canceled then order_id end) as canceled_orders
    from orders
    group by 1
),

revenue_agg as (
    select
        o.order_date,
        sum(oi.price)::numeric(18, 2) as total_revenue,
        sum(oi.freight_value)::numeric(18, 2) as total_freight
    from orders o
    left join order_items oi
        on o.order_id = oi.order_id
    group by 1
),

review_agg as (
    select
        o.order_date,
        avg(r.average_review_score)::numeric(18, 2) as average_review_score
    from orders o
    left join order_reviews r
        on o.order_id = r.order_id
    group by 1
),

final as (
    select
        oa.order_date,
        oa.total_orders,
        oa.delivered_orders,
        oa.canceled_orders,
        coalesce(ra.total_revenue, 0)::numeric(18, 2) as total_revenue,
        coalesce(ra.total_freight, 0)::numeric(18, 2) as total_freight,
        case
            when oa.total_orders = 0 then null
            else (coalesce(ra.total_revenue, 0) / oa.total_orders)::numeric(18, 2)
        end as average_ticket,
        rv.average_review_score
    from orders_agg oa
    left join revenue_agg ra
        on oa.order_date = ra.order_date
    left join review_agg rv
        on oa.order_date = rv.order_date
)

select * from final
