import Link from "next/link";
import { getLocale } from "next-intl/server";

import { getMenus } from "@/lib/drupal/get-menus";
import { removeLocaleFromPath } from "@/lib/utils";
import FacebookIcon from "@/styles/icons/facebook.svg";
import LinkedInIcon from "@/styles/icons/linkedin.svg";
import TwitterIcon from "@/styles/icons/twitter.svg";
import WunderCarrotIcon from "@/styles/icons/wunder-carrot.svg";
import type { MenuItemType } from "@/types/graphql";

import { SocialShare } from "./social-share";

export async function Footer() {
  const locale = await getLocale();
  const { footer: footerMenu } = await getMenus(locale);

  // Only show the footerMenu items that match the current locale
  const filteredItems = footerMenu?.items?.filter(
    (link) => link.langcode?.id == locale,
  );

  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6">
        <nav className="text-md flex flex-col items-center gap-2 py-8 sm:flex-row sm:justify-between">
          <ul className="mr-4 flex flex-wrap gap-x-12 gap-y-4">
            {filteredItems?.map((link) => {
              const icon = link.attributes?.icon;
              const href = removeLocaleFromPath(locale, link.url);
              return (
                <li key={link.id}>
                  <FooterLink href={href} icon={icon}>
                    {link.title}
                  </FooterLink>
                </li>
              );
            })}
          </ul>
          <SocialShare />
          <FooterLink href="https://next-drupal.org" newTab>
            Next.js for Drupal
          </FooterLink>
        </nav>
      </div>
    </footer>
  );
}

interface FooterLinkProps {
  href: MenuItemType["url"];
  icon?: MenuItemType["attributes"]["icon"];
  newTab?: boolean;
  children: React.ReactNode;
}

function FooterLink({ href, icon, newTab = false, children }: FooterLinkProps) {
  const [target, rel] = newTab ? ["_blank", "noreferrer"] : [];

  const Icon = {
    facebook: FacebookIcon,
    linkedin: LinkedInIcon,
    twitter: TwitterIcon,
    wunder: WunderCarrotIcon,
  }[icon];

  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className="hyperlink flex hover:underline"
    >
      {icon && (
        <div className="mr-2 flex h-6 w-6 items-center justify-center">
          <Icon className="h-auto w-full" aria-hidden />
        </div>
      )}
      {children}
    </Link>
  );
}
