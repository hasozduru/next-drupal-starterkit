"use client";

import { useTranslations } from "next-intl";
import { Suspense, useState } from "react";

import { MainMenu, MenuToggle } from "@/components/main-menu/main-menu";
import SearchIcon from "@/styles/icons/search.svg";
import WunderIcon from "@/styles/icons/wunder.svg";
import type { MenuType } from "@/types/graphql";

import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggler } from "./theme-toggler";
import { UserMenu } from "./user-menu";

import { LinkWithLocale } from "@/i18n/routing";

interface HeaderProps {
  menu?: MenuType;
}

export function Header({ menu }: HeaderProps) {
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);

  return (
    <header className="z-50 flex-shrink-0 border-b border-border bg-background text-primary md:sticky md:top-0">
      <nav className="mx-auto flex max-w-6xl flex-row items-center justify-between px-6 py-4">
        <HomeLink />
        <div className="flex flex-row items-center justify-end gap-4 sm:gap-6">
          <SearchLink />
          <Suspense fallback={null}>
            <UserMenu />
          </Suspense>
          <LanguageSwitcher />
          <ThemeToggler />
          <MenuToggle isOpen={isMainMenuOpen} setIsOpen={setIsMainMenuOpen} />
        </div>
      </nav>
      <MainMenu
        menu={menu}
        isOpen={isMainMenuOpen}
        setIsOpen={setIsMainMenuOpen}
      />
    </header>
  );
}

function HomeLink() {
  const t = useTranslations();

  return (
    <LinkWithLocale href="/" className="inline">
      <WunderIcon className="w-32 pb-2" />
      <span className="sr-only">{t("homepage-link")}</span>
    </LinkWithLocale>
  );
}

function SearchLink() {
  const t = useTranslations();

  return (
    <LinkWithLocale href="/search" className="hover:underline">
      <span className="sr-only sm:not-sr-only sm:mr-2 sm:inline">
        {t("search")}
      </span>
      <SearchIcon className="inline-block h-6 w-6" aria-hidden="true" />
    </LinkWithLocale>
  );
}
