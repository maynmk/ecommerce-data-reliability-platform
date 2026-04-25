{{ config(materialized='table') }}

with products as (
    select
        product_id,
        product_category_name,
        product_name_length,
        product_description_length,
        product_photos_qty,
        product_weight_g,
        product_length_cm,
        product_height_cm,
        product_width_cm
    from {{ ref('stg_products') }}
),

category_translation as (
    select
        category_name_pt,
        category_name_en
    from {{ ref('stg_product_category_name_translation') }}
),

final as (
    select
        p.product_id,
        p.product_category_name,
        t.category_name_en as product_category_name_english,
        p.product_name_length,
        p.product_description_length,
        p.product_photos_qty,
        p.product_weight_g,
        p.product_length_cm,
        p.product_height_cm,
        p.product_width_cm
    from products p
    left join category_translation t
        on p.product_category_name = t.category_name_pt
)

select * from final
