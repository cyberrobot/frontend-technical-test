// eslint-disable-next-line no-unused-vars
import { request } from "./helpers";

/**
 * Pull vehicles information
 *
 * @return {Promise<Array.<vehicleSummaryPayload>>}
 */
// TODO: All API related logic should be made inside this function.
export default async function getData() {
    const summaries = await request("/api/vehicles.json");

    if (!Array.isArray(summaries)) {
        throw new Error("Vehicle list response must be an array");
    }

    const results = await Promise.all(
        summaries.map(async (summary) => {
            if (
                !summary ||
                typeof summary.apiUrl !== "string" ||
                !summary.apiUrl
            )
                return null;

            try {
                const details = await request(summary.apiUrl);

                if (!details.price || !details.price.trim()) return null;

                return { ...summary, ...details };
            } catch {
                // A broken detail endpoint should not prevent other vehicles loading.
                return null;
            }
        }),
    );

    return results.filter(Boolean);
}
