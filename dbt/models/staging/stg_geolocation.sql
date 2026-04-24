with source as (
    select * from {{ source('bronze', 'geolocation') }}
),

renamed as (
    select
        nullif(geolocation_zip_code_prefix, '')::int as zip_code_prefix,
        nullif(geolocation_lat, '')::double precision as latitude,
        nullif(geolocation_lng, '')::double precision as longitude,
        geolocation_city as city,
        geolocation_state as state,
        ingestion_run_id as _ingestion_run_id,
        source_file as _source_file,
        ingested_at as _ingested_at
    from source
)

select * from renamed
