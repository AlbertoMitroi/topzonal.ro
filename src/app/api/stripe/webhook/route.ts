import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const config = {
  runtime: "nodejs",
};

export async function POST(req: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret || !webhookSecret) {
    return new NextResponse("Stripe environment variables are missing", {
      status: 500,
    });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2025-09-30.clover" });

  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("Missing Stripe-Signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new NextResponse(`Webhook Error: ${(err as Error).message}`, {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkId = session.metadata?.clerkId;

    if (!clerkId) {
      return new NextResponse("Webhook Error: No clerkId in metadata", {
        status: 400,
      });
    }

    console.log(`Payment successful for user: ${clerkId}`);

    // Exemplu: update user în DB
    // await db.user.update({
    //   where: { clerkId },
    //   data: { isPremium: true, subscriptionEndDate: ... },
    // });
  }

  return new NextResponse(null, { status: 200 });
}
