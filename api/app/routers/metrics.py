from __future__ import annotations

from fastapi import APIRouter, Query, Request

from api.app.core.query import fetch_all, fetch_one


router = APIRouter(prefix="/metrics", tags=["metrics"])


def _limit_param(limit: int) -> int:
    return max(1, min(limit, 1000))


@router.get("/overview")
def metrics_overview(request: Request) -> dict:
    engine = request.app.state.engine

    tables = fetch_all(
        engine,
        """
        select 'mart_sales_daily' as table_name, count(*)::bigint as row_count from gold.mart_sales_daily
        union all
        select 'mart_delivery_performance' as table_name, count(*)::bigint as row_count from gold.mart_delivery_performance
        union all
        select 'mart_seller_performance' as table_name, count(*)::bigint as row_count from gold.mart_seller_performance
        union all
        select 'mart_product_performance' as table_name, count(*)::bigint as row_count from gold.mart_product_performance
        union all
        select 'mart_data_quality_summary' as table_name, count(*)::bigint as row_count from gold.mart_data_quality_summary
        """,
    )

    latest_sales = fetch_one(
        engine,
        """
        select *
        from gold.mart_sales_daily
        where order_date = (select max(order_date) from gold.mart_sales_daily)
        """,
    )

    latest_checked_at = fetch_one(
        engine,
        "select max(checked_at) as checked_at from gold.mart_data_quality_summary",
    )
    checked_at_value = latest_checked_at["checked_at"] if latest_checked_at else None
    data_quality = []
    if checked_at_value is not None:
        data_quality = fetch_all(
            engine,
            """
            select metric_name, metric_value, checked_at
            from gold.mart_data_quality_summary
            where checked_at = :checked_at
            order by metric_name
            """,
            {"checked_at": checked_at_value},
        )

    return {"tables": tables, "latest_sales_daily": latest_sales, "data_quality": data_quality}


@router.get("/sales-daily")
def metrics_sales_daily(
    request: Request,
    limit: int = Query(100, ge=1, le=1000),
) -> list[dict]:
    engine = request.app.state.engine
    return fetch_all(
        engine,
        """
        select *
        from gold.mart_sales_daily
        order by order_date desc
        limit :limit
        """,
        {"limit": _limit_param(limit)},
    )


@router.get("/delivery-performance")
def metrics_delivery_performance(
    request: Request,
    limit: int = Query(100, ge=1, le=1000),
) -> list[dict]:
    engine = request.app.state.engine
    return fetch_all(
        engine,
        """
        select *
        from gold.mart_delivery_performance
        order by total_orders desc nulls last
        limit :limit
        """,
        {"limit": _limit_param(limit)},
    )


@router.get("/seller-performance")
def metrics_seller_performance(
    request: Request,
    limit: int = Query(100, ge=1, le=1000),
) -> list[dict]:
    engine = request.app.state.engine
    return fetch_all(
        engine,
        """
        select *
        from gold.mart_seller_performance
        order by total_revenue desc nulls last
        limit :limit
        """,
        {"limit": _limit_param(limit)},
    )


@router.get("/product-performance")
def metrics_product_performance(
    request: Request,
    limit: int = Query(100, ge=1, le=1000),
) -> list[dict]:
    engine = request.app.state.engine
    return fetch_all(
        engine,
        """
        select *
        from gold.mart_product_performance
        order by total_revenue desc nulls last
        limit :limit
        """,
        {"limit": _limit_param(limit)},
    )


@router.get("/data-quality")
def metrics_data_quality(
    request: Request,
    limit: int = Query(100, ge=1, le=1000),
) -> list[dict]:
    engine = request.app.state.engine
    return fetch_all(
        engine,
        """
        select *
        from gold.mart_data_quality_summary
        order by checked_at desc, metric_name asc
        limit :limit
        """,
        {"limit": _limit_param(limit)},
    )
