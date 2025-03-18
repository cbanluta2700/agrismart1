// @ts-ignore
// @ts-nocheck
"use client";

import {
  JSXElementConstructor,
  Key,
  PromiseLikeOfReactNode,
  ReactElement,
  ReactNode,
  useState,
} from "react";
import Link from "next/link";
import Balancer from "react-wrap-balancer";

import { Button, buttonVariants } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";
import { Switch } from "@saasfly/ui/switch";

import { priceDataMap } from "~/config/price/price-data";
import { useSigninModal } from "~/hooks/use-signin-modal";

interface PricingCardsProps {
  userId?: string;
  dict: Record<string, string>;
  params: {
    lang: string;
  };
}

export function PricingCards({
  userId,
  dict,
  params: { lang },
}: PricingCardsProps) {
  const isYearlyDefault = true;
  const [isYearly, setIsYearly] = useState<boolean>(isYearlyDefault);
  const signInModal = useSigninModal();
  const pricingData = priceDataMap[lang];
  const toggleBilling = () => {
    setIsYearly(!isYearly);
  };
  return (
    <section className="container flex flex-col items-center text-center">
      <div className="mx-auto mb-10 flex w-full flex-col gap-5">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          {dict.pricing}
        </p>
        <h1 className="text-3xl font-bold sm:text-5xl">{dict.plan}</h1>
      </div>
      <div className="mb-4 flex items-center gap-5">
        <span
          className={`text-sm ${isYearly ? "text-muted-foreground" : "font-semibold"}`}
        >
          {dict.monthly}
        </span>
        <Switch
          checked={isYearly}
          onCheckedChange={toggleBilling}
          aria-label="Toggle between monthly and yearly billing"
        />
        <span
          className={`text-sm ${isYearly ? "font-semibold" : "text-muted-foreground"}`}
        >
          {dict.yearly}
        </span>
      </div>
      <div className="mx-auto grid w-full max-w-screen-lg grid-cols-1 gap-5 lg:grid-cols-3">
        {pricingData.map((offer) => (
          <div
            key={offer.title}
            className={`relative flex flex-col justify-between rounded-lg border p-6 shadow-sm ${
              offer.planType === "FREE"
                ? "border-muted bg-muted/50"
                : offer.planType === "PRO"
                ? "border-primary bg-secondary/10"
                : "border-primary/40"
            }`}
          >
            {offer.planType === "PRO" && (
              <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 px-3 py-2 text-sm font-medium text-white">
                {dict.popular}
              </div>
            )}

            <div>
              <h3 className="my-3 text-center text-2xl font-bold">
                {offer.title}
              </h3>
              <div className="mb-4 text-center text-4xl font-bold">
                {isYearly ? (
                  <>
                    $
                    {new Intl.NumberFormat().format(
                      Math.floor(offer.prices.yearly / 12),
                    )}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / {dict.mo}
                    </span>
                  </>
                ) : (
                  <>
                    ${new Intl.NumberFormat().format(offer.prices.monthly)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / {dict.mo}
                    </span>
                  </>
                )}
              </div>
              <p className="mb-6 text-center text-gray-500">
                <Balancer>
                  {offer.description
                    ? offer.description
                    : "All the features you need to grow your business."}
                </Balancer>
              </p>

              <ul className="mb-6 space-y-2 text-left">
                {offer.benefits.map(
                  (
                    benefit:
                      | string
                      | number
                      | boolean
                      | ReactElement<any, string | JSXElementConstructor<any>>
                      | Iterable<ReactNode>
                      | PromiseLikeOfReactNode
                      | null
                      | undefined,
                    index: Key | null | undefined,
                  ) => (
                    <li key={index} className="flex items-center gap-2">
                      <Icons.CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{benefit}</span>
                    </li>
                  ),
                )}
                {offer.limitations.map(
                  (
                    limitation:
                      | string
                      | number
                      | boolean
                      | ReactElement<any, string | JSXElementConstructor<any>>
                      | Iterable<ReactNode>
                      | PromiseLikeOfReactNode
                      | null
                      | undefined,
                    index: Key | null | undefined,
                  ) => (
                    <li key={index} className="flex items-center gap-2">
                      <Icons.XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-muted-foreground">
                        {limitation}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              {userId ? (
                offer.planType === "FREE" ? (
                  <Link
                    href={`/${lang}/dashboard`}
                    className={buttonVariants({ variant: "secondary" })}
                  >
                    {dict.current_plan}
                  </Link>
                ) : (
                  <Link
                    href={`/${lang}/dashboard`}
                    className={buttonVariants({ variant: "default" })}
                  >
                    {dict.get_started}
                  </Link>
                )
              ) : (
                <Button
                  onClick={() => signInModal.onOpen()}
                  className={
                    offer.planType === "FREE"
                      ? "bg-muted-foreground hover:bg-muted-foreground/80"
                      : ""
                  }
                >
                  {dict.get_started}
                </Button>
              )}

              {offer.planType !== "FREE" && (
                <div className="text-xs text-muted-foreground">
                  {dict.cancel_anytime}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
