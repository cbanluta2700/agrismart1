import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "~/lib/get-dictionary";

import { CodeCopy } from "~/components/code-copy";
import { Comments } from "~/components/comments";
import { FeaturesGrid } from "~/components/features-grid";
import { RightsideMarketing } from "~/components/rightside-marketing";

import { AnimatedTooltip } from "@saasfly/ui/animated-tooltip";
import { BackgroundLines } from "@saasfly/ui/background-lines";
import { Button } from "@saasfly/ui/button";
import { ColourfulText } from "@saasfly/ui/colorful-text";
import * as Icons from "@saasfly/ui/icons";

import type { Locale } from "~/config/i18n-config";
import {VideoScroll} from "~/components/video-scroll";

// Agricultural experts for the platform
const people = [
  {
    id: 1,
    name: "Dr. Emily Chen",
    designation: "Agricultural Scientist",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&h=250&auto=format&fit=crop",
    link: "#",
  },
  {
    id: 2,
    name: "Thomas Rodriguez",
    designation: "Organic Farming Expert",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&h=250&auto=format&fit=crop",
    link: "#",
  },
  {
    id: 3,
    name: "Sarah Johnson",
    designation: "Market Analyst",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&h=250&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Michael Webb",
    designation: "Equipment Specialist",
    image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=250&h=250&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Amara Patel",
    designation: "Sustainable Farming Advocate",
    image: "https://images.unsplash.com/photo-1503185912284-5271ff81b9a8?w=250&h=250&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "Robert Kim",
    designation: "Agricultural Economist",
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=250&h=250&auto=format&fit=crop",
  },
];

export default async function IndexPage({
  params: { lang },
}: {
  params: {
    lang: Locale;
  };
}) {
  const dict = await getDictionary(lang);

  return (
    <>
      <section className="container">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-2">
          <div className="flex flex-col items-start h-full">
            <BackgroundLines className="h-full">
              <div className="flex flex-col pt-4 md:pt-36 lg:pt-36 xl:pt-36">
                <div className="mt-20">
                  <div
                    className="mb-6 max-w-4xl text-left text-4xl font-semibold dark:text-zinc-100 md:text-5xl xl:text-5xl md:leading-[4rem] xl:leading-[4rem]">
                    Connecting Farmers, Buyers, and Resources with  
                    <ColourfulText text=" AgriSmart"/>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-neutral-500 dark:text-neutral-400 sm:text-lg">
                    The complete platform for sustainable farming, direct marketplace access, and agricultural community support.
                  </span>
                </div>

                <div
                  className="mb-4 mt-6 flex w-full flex-col justify-center space-y-4 sm:flex-row sm:justify-start sm:space-x-8 sm:space-y-0 z-10">
                  <Link href={`/${lang}/marketplace`}>
                    <Button
                      className="bg-green-600 hover:bg-green-500 text-white rounded-full text-lg px-6 h-12 font-medium">
                      Explore Marketplace
                      <Icons.ArrowRight className="h-5 w-5"/>
                    </Button>
                  </Link>

                  <Link href={`/${lang}/community`}>
                    <Button
                      variant="outline"
                      className="rounded-full text-lg px-6 h-12 font-medium">
                      Join Community
                      <Icons.User className="ml-2 h-5 w-5"/>
                    </Button>
                  </Link>
                </div>

                <div className="flex xl:flex-row flex-col items-center justify-start mt-4 w-full">
                  <div className="flex">
                    <AnimatedTooltip items={people}/>
                  </div>
                  <div className="flex flex-col items-center justify-start ml-8">
                    <div className="w-[340px]">
                      <text className="font-semibold">5,000+ </text>
                      <text
                        className="text-neutral-500 dark:text-neutral-400">farmers and agricultural businesses connected</text>
                    </div>
                    <div className="w-[340px]">
                      <text
                        className="text-neutral-500 dark:text-neutral-400">Join a community of over </text>
                      <ColourfulText text="10,000"/>
                      <text
                        className="text-neutral-500 dark:text-neutral-400"> active members in the agricultural sector</text>
                    </div>
                  </div>
                </div>
              </div>
            </BackgroundLines>
          </div>

          <div className="hidden h-full w-full xl:block bg-background">
            <div className="flex flex-col pt-44">
              <RightsideMarketing dict={dict.marketing.right_side}/>
            </div>
          </div>
        </div>
      </section>

      <section className="container mt-8 md:mt-[-180px] xl:mt-[-180px]">
        <FeaturesGrid dict={dict.marketing.features_grid}/>
      </section>

      <section className="container pt-24">
        <div className="flex flex-col justify-center items-center pt-10">
          <div className="text-lg text-neutral-500 dark:text-neutral-400">Supported by Agricultural Partners</div>
          <div className="mt-4 flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl border-2 border-neutral-300 dark:border-neutral-700">
              <span className="text-sm font-medium">FarmTech Solutions</span>
            </div>
            <div className="px-4 py-2 rounded-xl border-2 border-neutral-300 dark:border-neutral-700">
              <span className="text-sm font-medium">EcoGrow Association</span>
            </div>
            <div className="px-4 py-2 rounded-xl border-2 border-neutral-300 dark:border-neutral-700">
              <span className="text-sm font-medium">AgriInnovate Fund</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container pt-8">
        <VideoScroll dict={dict.marketing.video}/>
      </section>

      <section className="w-full px-8 pt-10 sm:px-0 sm:pt-24 md:px-0 md:pt-24 xl:px-0 xl:pt-24">
        <div className="flex h-full w-full flex-col items-center pb-[100px] pt-10">
          <div>
            <h1 className="mb-6 text-center text-3xl font-bold dark:text-zinc-100 md:text-5xl">
              What Farmers & Buyers Are Saying
            </h1>
          </div>
          <div className="mb-6 text-lg text-neutral-500 dark:text-neutral-400">
            Real stories from our community members who have transformed their agricultural businesses with AgriSmart
          </div>

          <div className="w-full overflow-x-hidden">
            <Comments/>
          </div>
        </div>
      </section>
    </>
  );
}
