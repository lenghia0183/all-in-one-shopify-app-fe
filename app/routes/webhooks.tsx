import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { ShopifyHeader } from "@shopify/shopify-api";
import { HashFormat, createSHA256HMAC } from "@shopify/shopify-api/runtime";
import cache from "@/cache.server";
import { apiNoToken } from "@/services/axios";
import { WebhookTopicEnum } from "@/constants/webhook-topic";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin } = await authenticate.webhook(request);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  /**
   * Note: Shopify can trigger webhooks multiple times for the same event.
   * Ex: Create a product may trigger PRODUCTS_CREATE, then PRODUCTS_UPDATE after.
   * See issue: https://shopify.dev/docs/apps/build/webhooks/ignore-duplicates
   * Resolved: use eventId to check: const eventId = request.headers.get('X-Shopify-Event-Id');
   */
  const eventId = request.headers.get("X-Shopify-Event-Id");
  if (eventId && cache.isWebhookProcessed(eventId, shop)) {
    return new Response(null, { status: 200 });
  }
  if (eventId) cache.markWebhookAsProcessed(eventId, shop);

  let hmac = "";
  if (
    [
      WebhookTopicEnum.APP_UNINSTALLED,
      WebhookTopicEnum.SHOP_UPDATE,
      WebhookTopicEnum.PRODUCTS_UPDATE,
      WebhookTopicEnum.PRODUCTS_DELETE,
    ].includes(topic as WebhookTopicEnum) &&
    session
  ) {
    hmac = await createSHA256HMAC(
      process.env.SHOPIFY_API_SECRET_KEY as string,
      shop,
      HashFormat.Base64,
    );
  }

  // Set HMAC header for all API calls
  apiNoToken.instance.defaults.headers.common[ShopifyHeader.Hmac] = hmac;

  (async () => {
    switch (topic) {
      case WebhookTopicEnum.APP_UNINSTALLED:
        if (session) {
          await db.session.deleteMany({ where: { shop } });

          await apiNoToken.post("/webhooks/app/uninstalled", {
            domain: shop,
          });
        }
        break;

      case WebhookTopicEnum.SHOP_UPDATE:
        if (session) {
          await apiNoToken.post("/webhooks/shop/update", {
            domain: shop,
            token: session.accessToken,
          });
        }
        break;

      case WebhookTopicEnum.PRODUCTS_UPDATE:
      case WebhookTopicEnum.PRODUCTS_DELETE:
        if (session) {
          await apiNoToken.post("/webhooks/products/sync", {
            /**
             * Truyền thêm payload để dành tối ưu về sau --> chỉ sync những gì thay đổi thay vì call lại cả đống
             * Tạm thời để payload là {}, vì bên api sync đang chưa dùng --> 2000 variant truyền payload lên chớ api
             * --> lỗi PayloadTooLargeError: request entity too large\n
             *
             * body: JSON.stringify({ topic, domain: shop, token: session.accessToken, payload }),
             */
            topic,
            domain: shop,
            token: session.accessToken,
            payload: {},
          });
        }
        break;

      case WebhookTopicEnum.CUSTOMERS_DATA_REQUEST:
      case WebhookTopicEnum.CUSTOMERS_REDACT:
      case WebhookTopicEnum.SHOP_REDACT:
        return; // registered by toml
      default:
        console.warn(
          "\x1b[31m%s\x1b[0m",
          `[Webhook] Received unhandled topic: ${topic}`,
        );
        return;
    }
  })().catch((error) => {
    console.error("\x1b[31m%s\x1b[0m", "[Webhook async error]", error);
  });
  /** Trả về ngay, còn sync thì call ngầm, nếu mà đợi sync xong mới trả về, shopify thấy response mà trả về sau 5 giây thì nó sẽ coi đó là fail và tiến hành bắn thêm webhook nữa */
  /** Docs: https://shopify.dev/docs/apps/build/webhooks/troubleshooting-webhooks?utm_source=chatgpt.com#troubleshooting-failed-deliveries */
  return new Response(null, { status: 200 });
};
