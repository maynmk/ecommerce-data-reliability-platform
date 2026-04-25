{{ config(materialized='table') }}

with orders as (
    select
        order_id,
        customer_id,
        is_delivered,
        is_late_delivery,
        delivery_time_days,
        delivery_delay_days
    from {{ ref('fct_orders') }}
),

customers as (
    select
        customer_id,
        customer_state
    from {{ ref('dim_customers') }}
),

final as (
    select
        c.customer_state,
        count(distinct o.order_id) as total_orders,
        count(distinct case when o.is_delivered then o.order_id end) as delivered_orders,
        count(distinct case when o.is_late_delivery then o.order_id end) as late_orders,
        case
            when count(distinct case when o.is_delivered then o.order_id end) = 0 then null
            else (
                count(distinct case when o.is_late_delivery then o.order_id end)::numeric
                / count(distinct case when o.is_delivered then o.order_id end)
            )::numeric(18, 4)
        end as late_delivery_rate,
        avg(case when o.is_delivered then o.delivery_time_days end)::numeric(18, 2) as avg_delivery_time_days,
        avg(case when o.is_late_delivery then o.delivery_delay_days end)::numeric(18, 2) as avg_delay_days
    from orders o
    inner join customers c
        on o.customer_id = c.customer_id
    group by 1
)

select * from final
