with source as (
    select * from {{ source('bronze', 'customers') }}
),

renamed as (
    select
        customer_id,
        customer_unique_id,
        nullif(customer_zip_code_prefix, '')::int as zip_code_prefix,
        customer_city as city,
        customer_state as state,
        ingestion_run_id as _ingestion_run_id,
        source_file as _source_file,
        ingested_at as _ingested_at
    from source
)

select * from renamed
