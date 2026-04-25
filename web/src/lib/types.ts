export type OverviewResponse = {
  tables: { table_name: string; row_count: number }[];
  latest_sales_daily: SalesDailyRow | null;
  data_quality: DataQualityRow[];
};

export type SalesDailyRow = {
  order_date: string;
  total_orders: number;
  delivered_orders: number;
  canceled_orders: number;
  total_revenue: number;
  total_freight: number;
  average_ticket: number | null;
  average_review_score: number | null;
};

export type DeliveryPerformanceRow = {
  customer_state: string;
  total_orders: number;
  delivered_orders: number;
  late_orders: number;
  late_delivery_rate: number | null;
  avg_delivery_time_days: number | null;
  avg_delay_days: number | null;
};

export type SellerPerformanceRow = {
  seller_id: string;
  seller_state: string;
  total_orders: number;
  total_items_sold: number;
  total_revenue: number;
  total_freight: number;
  avg_item_price: number | null;
  avg_review_score: number | null;
  late_delivery_rate: number | null;
};

export type ProductPerformanceRow = {
  product_category_name_english: string;
  total_orders: number;
  total_items_sold: number;
  total_revenue: number;
  avg_item_price: number | null;
  avg_freight_value: number | null;
  avg_review_score: number | null;
};

export type DataQualityRow = {
  metric_name: string;
  metric_value: number;
  checked_at: string;
};

