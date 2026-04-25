{{ config(materialized='table') }}

with customers as (
    select
        customer_id,
        customer_unique_id,
        zip_code_prefix as customer_zip_code_prefix,
        city as customer_city,
        state as customer_state
    from {{ ref('stg_customers') }}
)

select * from customers
