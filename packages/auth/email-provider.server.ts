// This file should only be imported in server components
"use server";

import EmailProvider from "next-auth/providers/email";
import { MagicLinkEmail, resend, siteConfig } from "@saasfly/common";
import { env } from "./env.mjs";

// Export a function to create the email provider
// This ensures nodemailer is only loaded on the server
export function createEmailProvider() {
  return EmailProvider({
    // Use the Resend API for sending emails instead of directly using nodemailer
    async sendVerificationRequest({ identifier, url }) {
      try {
        await resend.emails.send({
          from: `${siteConfig.name} <${env.RESEND_FROM}>`,
          to: [identifier],
          subject: `Sign in to ${siteConfig.name}`,
          react: MagicLinkEmail({
            firstName: "",
            actionUrl: url,
            mailType: "login",
            siteName: siteConfig.name,
          }),
          headers: {
            "X-Entity-Ref-ID": new Date().getTime() + "",
          },
        });
      } catch (error) {
        console.error("Failed to send verification email", error);
        throw new Error("Failed to send verification email");
      }
    },
  });
}
