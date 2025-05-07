import { notifyStockMissing } from "./notification_controller";

type StockUpdatesDTO = {
  withoutVariations: {
    id: string;
    available_quantity: number;
  }[];
  withVariations: {
    productId: string;
    variations: {
      id: number;
      available_quantity: number;
    }[];
  }[];
};

export function getStockUpdates(
  meliProducts: Product[],
  sheetProducts: ProcessedRow[]
): StockUpdatesDTO {
  let toReturn: StockUpdatesDTO = {
    withoutVariations: [],
    withVariations: [],
  };

  for (const product of sheetProducts) {
    const meliProduct = meliProducts.find(
      (meliProduct) => meliProduct.id === product.meliId
    );
    if (!meliProduct) continue; // Skip if the product is not found in Mercado Libre

    if (meliProduct.variations.length > 0) {
      const variation = meliProduct.variations.find((variation) =>
        variation.attributes.some(
          (attribute) =>
            attribute.name === "SKU" && attribute.value_name === product.sku
        )
      );
      console.log("Variations:", product.sku); // Log the variation for debugging
      if (
        process.env.MIN_STOCK &&
        parseInt(process.env.MIN_STOCK) > -1 &&
        product.stock <= parseInt(process.env.MIN_STOCK)
      ) {
        notifyStockMissing(product.meliId);
      }
      if (!variation || variation.available_quantity === product.stock)
        continue; // Skip if the variation is not found or stock is the same
      console.log("Variation found:", variation); // Log the variation for debugging
      if (
        toReturn.withVariations.some(
          (item) => item.productId === meliProduct.id
        )
      ) {
        const existingProduct = toReturn.withVariations.find(
          (item) => item.productId === meliProduct.id
        );
        if (existingProduct) {
          toReturn.withVariations = toReturn.withVariations.map((item) => {
            if (item.productId === meliProduct.id) {
              return {
                ...item,
                variations: [
                  ...item.variations,
                  {
                    id: variation.id,
                    available_quantity: product.stock,
                  },
                ],
              };
            }
            return item;
          });
        }
      } else {
        toReturn.withVariations = [
          ...toReturn.withVariations,
          {
            productId: meliProduct.id,
            variations: [
              {
                id: variation.id,
                available_quantity: product.stock,
              },
            ],
          },
        ];
      }
    } else {
      if (meliProduct.available_quantity === product.stock) continue; // Skip if stock is the same
      toReturn.withoutVariations.push({
        id: meliProduct.id,
        available_quantity: product.stock,
      });
    }
  }

  return toReturn;
}

type PriceUpdatesDTO = {
  withoutVariations: {
    id: string;
    price: number;
  }[];
  withVariations: {
    productId: string;
    price: number;
    variations: number[];
  }[];
};

export function getPriceUpdates(
  meliProducts: Product[],
  sheetProducts: ProcessedRow[]
): PriceUpdatesDTO {
  let toReturn: PriceUpdatesDTO = {
    withoutVariations: [],
    withVariations: [],
  };

  for (const product of sheetProducts) {
    const meliProduct = meliProducts.find(
      (meliProduct) => meliProduct.id === product.meliId
    );
    if (!meliProduct) continue; // Skip if the product is not found in Mercado Libre

    if (meliProduct.variations.length > 0) {
      const variation = meliProduct.variations.find((variation) =>
        variation.attributes.some(
          (attribute) =>
            attribute.name === "SKU" && attribute.value_name === product.sku
        )
      );
      if (!variation || variation.price === product.price) continue; // Skip if the variation is not found or price is the same
      if (
        toReturn.withVariations.some(
          (item) => item.productId === meliProduct.id
        )
      ) {
        const existingProduct = toReturn.withVariations.find(
          (item) => item.productId === meliProduct.id
        );
        if (existingProduct) {
          toReturn.withVariations = toReturn.withVariations.map((item) => {
            if (item.productId === meliProduct.id) {
              return {
                ...item,
                variations: [...item.variations, variation.id],
              };
            }
            return item;
          });
        }
      } else {
        toReturn.withVariations = [
          ...toReturn.withVariations,
          {
            productId: meliProduct.id,
            price: product.price,
            variations: [variation.id],
          },
        ];
      }
    } else {
      if (meliProduct.price === product.price) continue; // Skip if price is the same
      toReturn.withoutVariations.push({
        id: meliProduct.id,
        price: product.price,
      });
    }
  }

  return toReturn;
}
