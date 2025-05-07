type ProductsDto = {
  code: number;
  body: Product;
};

type Product = {
  title: string;
  price: number;
  available_quantity: number;
  id: string;
  variations: Variation[];
};

type Variation = {
  user_product_id: string;
  price: number;
  attributes: {
    id: string;
    name: string;
    value_id: string;
    value_name: string;
    value_type: string;
  }[];
  id: number;
  available_quantity: number;
  seller_custom_field: null;
};

type PricesBody = {
  prices: number;
};

type PricesUpdateDto = {
  message: string;
  error: string;
  status: number;
  cause: any[];
};

type PricesDto = {
  id: string;
  prices: Price[];
};

type Price = {
  id: string;
  type: string;
  amount: number;
  regular_amount: number;
  currency_id: string;
  last_updated: string;
  conditions: {
    context_restrictions: string[];
    start_time: string;
    end_time: string;
    eligible_quantity: number;
    eligible_min_quantity: number;
    eligible_max_quantity: number;
    eligible_date_range: boolean;
    eligible_date_start: string;
    eligible_date_end: string;
    eligible_areas: string[];
    eligible_channels: string[];
  };
  exchange_rate_context: string;
};

type AuthDto = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token: string;
};
