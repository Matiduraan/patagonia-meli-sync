import { GoogleAuth } from "google-auth-library";
import { worksheetsProvider } from "../utils/providers";
import { google } from "googleapis";
import logger from "../utils/logger";

export async function getSheetInfo(spreadsheetId: string, range: string) {
  try {
    const auth = new GoogleAuth({
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const service = google.sheets({
      version: "v4",
      auth,
    });

    const result = await service.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    // console.log("Result:", result); // Log the result for debugging
    return result;
  } catch (error) {
    logger.error("Error fetching sheet info:", error);
    throw new Error("Error fetching sheet info");
  }
}
