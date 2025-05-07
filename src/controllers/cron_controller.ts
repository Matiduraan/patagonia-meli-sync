import {
  getProducts,
  updateProduct,
  updateVariationsPrice,
  updateVariationsStock,
} from "../services/mercadolibre_service";
import { getSheetInfo } from "../services/worksheet_service";
import logger from "../utils/logger";
import { getPriceUpdates, getStockUpdates } from "./main_controller";
import { processSheet } from "./sheet_controller";

export async function updatePrices() {
  try {
    const sheet = await getSheetInfo(
      process.env.SHEET_ID || "",
      process.env.SHEET_DATA_RANGE || "A1:Z1000"
    );
    if (!sheet.data.values) {
      logger.error("No data found in the sheet.");
      return;
    }
    const products = processSheet(sheet.data.values);

    const productIds = products.map((product) => product.meliId).join(",");

    const meliProducts = await getProducts(productIds);

    if (!meliProducts) {
      logger.error("No products found in Mercado Libre.");
      return;
    }

    const finalProducts = getPriceUpdates(meliProducts, products);

    const updates = await Promise.all([
      ...finalProducts.withVariations.map(async (product) =>
        updateVariationsPrice(
          product.productId,
          product.variations,
          product.price
        )
      ),
      ...finalProducts.withoutVariations.map(async (product) =>
        updateProduct({ price: product.price }, product.id)
      ),
    ]);

    return finalProducts;
  } catch (error) {
    logger.error("Error updating prices:", error);
  }
}

export async function updateStock() {
  try {
    const sheet = await getSheetInfo(
      process.env.SHEET_ID || "",
      process.env.SHEET_DATA_RANGE || "A1:Z1000"
    );
    if (!sheet.data.values) {
      logger.error("No data found in the sheet.");
      return;
    }
    const products = processSheet(sheet.data.values);

    const productIds = products.map((product) => product.meliId).join(",");

    const meliProducts = await getProducts(productIds);

    if (!meliProducts) {
      logger.error("No products found in Mercado Libre.");
      return;
    }

    const finalProducts = getStockUpdates(meliProducts, products);

    await Promise.all([
      ...finalProducts.withVariations.map(async (product) =>
        updateVariationsStock(product.variations, product.productId)
      ),
      ...finalProducts.withoutVariations.map(async (product) =>
        updateProduct(
          { available_quantity: product.available_quantity },
          product.id
        )
      ),
    ]);

    return finalProducts;
  } catch (error) {
    logger.error("Error updating stock:", error);
  }
}
