{{ config(materialized='table') }}

with reviews as (
    select
        md5(coalesce(review_id, '') || '|' || coalesce(order_id, '')) as review_key,
        review_id,
        order_id,
        review_score,
        review_creation_date::timestamp as review_created_at,
        review_answered_at,
        (review_score <= 2) as is_negative_review,
        (review_score >= 4) as is_positive_review
    from {{ ref('stg_order_reviews') }}
)

select * from reviews
