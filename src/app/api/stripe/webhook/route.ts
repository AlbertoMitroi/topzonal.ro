import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    const err = error as Error;
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const clerkId = session?.metadata?.clerkId;

    if (!clerkId) {
      return new NextResponse("Webhook Error: No clerkId in metadata", {
        status: 400,
      });
    }

    // Example: Update user model to grant premium access
    // await db.user.update({
    //   where: { clerkId },
    //   data: { isPremium: true, subscriptionEndDate: ... },
    // });
    console.log(`Payment successful for user: ${clerkId}`);
  }

  return new NextResponse(null, { status: 200 });
}
