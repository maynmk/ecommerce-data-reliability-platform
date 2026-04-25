{{ config(materialized='table') }}

with sellers as (
    select
        seller_id,
        zip_code_prefix as seller_zip_code_prefix,
        city as seller_city,
        state as seller_state
    from {{ ref('stg_sellers') }}
)

select * from sellers
