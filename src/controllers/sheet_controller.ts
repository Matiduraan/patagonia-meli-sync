const ROW_INDEXES = {
  MELI_ID: 0,
  STOCK: 31,
  PRICE: 22,
  SKU: 2,
};

export function processSheet(values: string[][]): ProcessedRow[] {
  return values.map(processRow).filter((row) => row !== null);
}

function processRow(row: Array<string>): ProcessedRow | null {
  try {
    if (!isRowValid(row)) return null;
    const priceNumber = row[ROW_INDEXES.PRICE]
      .replace("$", "")
      .replace(",", "");
    return {
      meliId: row[ROW_INDEXES.MELI_ID],
      stock: parseInt(row[ROW_INDEXES.STOCK]),
      price: parseFloat(priceNumber),
      sku: row[ROW_INDEXES.SKU],
    };
  } catch (error) {
    console.error("Error processing row:", error);
    return null;
  }
}

function isRowValid(row: Array<string>) {
  try {
    if (row.length < 4) return false; // Ensure the row has enough columns
    const title = row[ROW_INDEXES.MELI_ID];
    const stock = row[ROW_INDEXES.STOCK];
    const price = row[ROW_INDEXES.PRICE].replace("$", "").replace(",", "");
    const sku = row[ROW_INDEXES.SKU];
    // console.log("Row DATA:", title, stock, price); // Log the row data for debugging
    if (!title || !stock || !price || !sku) return false;
    if (!title.startsWith("MLA")) return false;
    if (isNaN(parseInt(stock))) return false;
    if (isNaN(parseFloat(price))) return false;

    return true;
  } catch (error) {
    return false;
  }
}
