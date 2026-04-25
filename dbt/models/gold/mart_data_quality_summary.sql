{{ config(materialized='table') }}

with orders as (
    select
        order_id,
        is_delivered,
        is_canceled,
        is_late_delivery
    from {{ ref('fct_orders') }}
),

payments as (
    select distinct order_id
    from {{ ref('fct_payments') }}
),

items as (
    select distinct order_id
    from {{ ref('fct_order_items') }}
),

reviews as (
    select distinct order_id
    from {{ ref('fct_reviews') }}
),

metrics as (
    select
        count(distinct o.order_id) as total_orders,
        count(distinct case when p.order_id is null then o.order_id end) as orders_without_payment,
        count(distinct case when i.order_id is null then o.order_id end) as orders_without_items,
        count(distinct case when r.order_id is null then o.order_id end) as orders_without_review,
        count(distinct case when o.is_delivered and o.is_late_delivery then o.order_id end) as delivered_orders_with_late_delivery,
        count(distinct case when o.is_canceled then o.order_id end) as canceled_orders
    from orders o
    left join payments p
        on o.order_id = p.order_id
    left join items i
        on o.order_id = i.order_id
    left join reviews r
        on o.order_id = r.order_id
)

select 'total_orders' as metric_name, total_orders::numeric as metric_value, current_timestamp as checked_at from metrics
union all
select 'orders_without_payment' as metric_name, orders_without_payment::numeric as metric_value, current_timestamp as checked_at from metrics
union all
select 'orders_without_items' as metric_name, orders_without_items::numeric as metric_value, current_timestamp as checked_at from metrics
union all
select 'orders_without_review' as metric_name, orders_without_review::numeric as metric_value, current_timestamp as checked_at from metrics
union all
select 'delivered_orders_with_late_delivery' as metric_name, delivered_orders_with_late_delivery::numeric as metric_value, current_timestamp as checked_at from metrics
union all
select 'canceled_orders' as metric_name, canceled_orders::numeric as metric_value, current_timestamp as checked_at from metrics
