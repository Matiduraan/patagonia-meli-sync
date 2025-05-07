import { AxiosError } from "axios";
import { mercadolibreProvider } from "../utils/providers";
import e from "express";

export let mercadoLibreAccessToken: string | null = null;
export let mercadolibreRefreshToken: string | null = null;

export async function auth() {
  try {
    console.log("Authenticating with Mercado Libre..."); // Log a message indicating the start of the authentication process
    const { data } = await mercadolibreProvider.post<AuthDto>("/oauth/token", {
      client_id: process.env.MELI_APP_ID,
      client_secret: process.env.MELI_CLIENT_SECRET,
      grant_type: "client_credentials",
    });
    console.log("Data:", data); // Log the response data for debugging
    const { access_token, refresh_token } = data;
    mercadoLibreAccessToken = access_token;
    mercadolibreRefreshToken = refresh_token;
    console.log("Access Token:", access_token);
    return { access_token, refresh_token };
  } catch (error) {
    console.error("Error during Mercado Libre authentication:", error);
    return null;
  }
}

export async function refresh() {
  try {
    const { data } = await mercadolibreProvider.post<AuthDto>("/oauth/token", {
      client_id: process.env.MELI_APP_ID,
      client_secret: process.env.MELI_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: process.env.ML_REFRESH_TOKEN,
    });
    const { access_token, refresh_token } = data;
    return { access_token, refresh_token };
  } catch (error) {}
}

export async function getProducts(ids: string) {
  try {
    let items: ProductsDto[] = [];
    if (ids.split(",").length > 50) {
      const idsArray = ids.split(",");
      const chunks = Math.ceil(idsArray.length / 50);
      for (let i = 0; i < chunks; i++) {
        const chunk = idsArray.slice(i * 50, (i + 1) * 50).join(",");
        const { data } = await mercadolibreProvider.get<ProductsDto[]>(
          `/items?ids=${chunk}&attributes=variations,price,title,id,available_quantity&include_attributes=all`
        );
        items = [...items, ...data];
      }
      return items
        .filter((item) => item !== null && item.code === 200)
        .map((item) => item.body);
    }
    const { data, config } = await mercadolibreProvider.get<ProductsDto[]>(
      `/items?ids=${ids}&attributes=variations,price,title,id,available_quantity&include_attributes=all`
    );
    // console.log("Config:", config); // Log the request config for debugging
    // console.log("Data:", data); // Log the response data for debugging
    return data
      .filter((item) => item !== null && item.code === 200)
      .map((item) => item.body);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

export async function getProductPrices(productId: string) {
  try {
    const { data } = await mercadolibreProvider.get<PricesDto>(
      `/items/${productId}/prices`
    );
    return data;
  } catch (error) {
    console.error("Error fetching product prices:", error);
  }
}

export function getProductById(id: string) {}

export async function updateProduct(
  newValue: Record<string, unknown>,
  productId: string
) {
  try {
    const { data, status } = await mercadolibreProvider.put<PricesUpdateDto>(
      `/items/${productId}`,
      { ...newValue }
    );
    console.log("Response data:", data.cause); // Log the response data for debugging
    return status === 200;
  } catch (error) {
    console.error("Error updating product price:", error);
    if (error instanceof AxiosError) {
      console.log("Response data:", error.response?.data.cause); // Log the response data for debugging
    }
    return false;
  }
}

// export function updateProductStock(newStock: number, productId: string) {}

type VariationNewStock = {
  id: number;
  available_quantity: number;
};

export async function updateVariationsStock(
  newStock: VariationNewStock[],
  productId: string
) {
  try {
    const { data, status } = await mercadolibreProvider.put<PricesUpdateDto>(
      `/items/${productId}`,
      { variations: newStock }
    );
    console.log("Response data:", data.cause); // Log the response data for debugging
    return status === 200;
  } catch (error) {
    console.error("Error updating variation stock:", error);
    if (error instanceof AxiosError) {
      console.log("Response data:", error.response?.data.cause); // Log the response data for debugging
    }
    return false;
  }
}

export async function updateVariationsPrice(
  productId: string,
  variations: number[],
  newPrice: number
) {
  try {
    const { data, status } = await mercadolibreProvider.put<PricesUpdateDto>(
      `/items/${productId}`,
      {
        variations: variations.map((variation) => ({
          id: variation,
          price: newPrice,
        })),
      }
    );
    console.log("Response data:", data.cause); // Log the response data for debugging
    return status === 200;
  } catch (error) {
    console.error("Error updating variation price:", error);
    if (error instanceof AxiosError) {
      console.log("Response data:", error.response?.data.cause); // Log the response data for debugging
    }
    return false;
  }
}

export async function getVariations(productId: string) {
  try {
    const { data } = await mercadolibreProvider.get<PricesDto>(
      `/items/${productId}?attributes=variations&include_attributes=all`
    );
    console.log("Variations data:", data); // Log the variations data for debugging
    return data;
  } catch (error) {
    console.error("Error fetching product variations:", error);
  }
}
