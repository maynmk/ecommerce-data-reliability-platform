with source as (
    select * from {{ source('bronze', 'products') }}
),

renamed as (
    select
        product_id,
        nullif(product_category_name, '') as product_category_name,
        nullif(product_name_lenght, '')::int as product_name_length,
        nullif(product_description_lenght, '')::int as product_description_length,
        nullif(product_photos_qty, '')::int as product_photos_qty,
        nullif(product_weight_g, '')::int as product_weight_g,
        nullif(product_length_cm, '')::int as product_length_cm,
        nullif(product_height_cm, '')::int as product_height_cm,
        nullif(product_width_cm, '')::int as product_width_cm,
        ingestion_run_id as _ingestion_run_id,
        source_file as _source_file,
        ingested_at as _ingested_at
    from source
)

select * from renamed
