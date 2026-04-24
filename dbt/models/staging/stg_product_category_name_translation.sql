with source as (
    select * from {{ source('bronze', 'product_category_name_translation') }}
),

renamed as (
    select
        nullif(product_category_name, '') as category_name_pt,
        nullif(product_category_name_english, '') as category_name_en,
        ingestion_run_id as _ingestion_run_id,
        source_file as _source_file,
        ingested_at as _ingested_at
    from source
)

select * from renamed
