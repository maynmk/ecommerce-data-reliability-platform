with source as (
    select * from {{ source('bronze', 'sellers') }}
),

renamed as (
    select
        seller_id,
        nullif(seller_zip_code_prefix, '')::int as zip_code_prefix,
        seller_city as city,
        seller_state as state,
        ingestion_run_id as _ingestion_run_id,
        source_file as _source_file,
        ingested_at as _ingested_at
    from source
)

select * from renamed
