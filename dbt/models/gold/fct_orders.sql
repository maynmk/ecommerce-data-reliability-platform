{{ config(materialized='table') }}

with orders as (
    select
        order_id,
        customer_id,
        order_status,
        purchased_at,
        approved_at,
        delivered_carrier_at,
        delivered_customer_at,
        estimated_delivery_date as estimated_delivery_at
    from {{ ref('stg_orders') }}
),

final as (
    select
        order_id,
        customer_id,
        order_status,
        purchased_at,
        approved_at,
        delivered_carrier_at,
        delivered_customer_at,
        estimated_delivery_at,
        (order_status = 'delivered') as is_delivered,
        (order_status = 'canceled') as is_canceled,
        (
            order_status = 'delivered'
            and delivered_customer_at is not null
            and estimated_delivery_at is not null
            and delivered_customer_at::date > estimated_delivery_at
        ) as is_late_delivery,
        case
            when order_status = 'delivered'
                and delivered_customer_at is not null
                and estimated_delivery_at is not null
            then greatest((delivered_customer_at::date - estimated_delivery_at), 0)
        end as delivery_delay_days,
        case
            when order_status = 'delivered'
                and delivered_customer_at is not null
                and purchased_at is not null
            then greatest((delivered_customer_at::date - purchased_at::date), 0)
        end as delivery_time_days
    from orders
)

select * from final
