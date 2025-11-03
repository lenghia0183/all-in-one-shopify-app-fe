import type { Session } from "@shopify/shopify-api";
import { ShopifyHeader } from "@shopify/shopify-api";
import { HashFormat, createSHA256HMAC } from "@shopify/shopify-api/runtime";
import { apiNoToken } from "./services/axios";

export default async function afterAuth({ shop, accessToken }: Session) {
  const hmac = await createSHA256HMAC(
    process.env.SHOPIFY_API_SECRET as string,
    shop,
    HashFormat.Base64,
  );

  apiNoToken.instance.defaults.headers.common[ShopifyHeader.Hmac] = hmac;

  await apiNoToken.post("/shop", {
    domain: shop,
    token: accessToken,
  });
}
