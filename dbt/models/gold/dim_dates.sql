{{ config(materialized='table') }}

with orders as (
    select
        purchased_at,
        approved_at,
        delivered_carrier_at,
        delivered_customer_at,
        estimated_delivery_date
    from {{ ref('stg_orders') }}
),

order_dates as (
    select purchased_at::date as date_day from orders where purchased_at is not null
    union all
    select approved_at::date as date_day from orders where approved_at is not null
    union all
    select delivered_carrier_at::date as date_day from orders where delivered_carrier_at is not null
    union all
    select delivered_customer_at::date as date_day from orders where delivered_customer_at is not null
    union all
    select estimated_delivery_date as date_day from orders where estimated_delivery_date is not null
),

bounds as (
    select
        min(date_day) as min_date,
        max(date_day) as max_date
    from order_dates
),

date_spine as (
    -- Date dimension is built only from dates present in stg_orders (min/max).
    select
        generate_series(min_date, max_date, interval '1 day')::date as date_day
    from bounds
),

final as (
    select
        date_day,
        extract(year from date_day)::int as year,
        extract(quarter from date_day)::int as quarter,
        extract(month from date_day)::int as month,
        to_char(date_day, 'FMMonth') as month_name,
        extract(day from date_day)::int as day,
        extract(isodow from date_day)::int as day_of_week,
        extract(week from date_day)::int as week_of_year,
        (extract(isodow from date_day) in (6, 7)) as is_weekend
    from date_spine
)

select * from final
