import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function sendOrderAlert(
  channel: string,
  orders: {
    order_number: string;
    customer_name: string;
    phone: string;
    days_pending: number;
  }[],
): Promise<void> {
  if (orders.length === 0) return;

  const lines = orders.map(
    (o) =>
      `• Order *${o.order_number}* — ${o.customer_name} | ${o.phone} | pending *${o.days_pending}d*`,
  );

  const text =
    `:warning: *${orders.length} order(s) pending for more than 3 days — please follow up:*\n\n` +
    lines.join("\n");

  await slack.chat.postMessage({ channel, text });
}
