with source as (
    select * from {{ source('bronze', 'order_reviews') }}
),

renamed as (
    select
        review_id,
        order_id,
        nullif(review_score, '')::int as review_score,
        nullif(review_comment_title, '') as review_comment_title,
        nullif(review_comment_message, '') as review_comment_message,
        nullif(review_creation_date, '')::date as review_creation_date,
        nullif(review_answer_timestamp, '')::timestamp as review_answered_at,
        ingestion_run_id as _ingestion_run_id,
        source_file as _source_file,
        ingested_at as _ingested_at
    from source
)

select * from renamed
