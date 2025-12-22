"use client";

import { Navbar as NavbarRu } from "./navbar-ru";
import { Navbar as NavbarKk } from "./navbar-kk";

interface NavbarWrapperProps {
    locale: string;
}

export function NavbarWrapper({ locale }: NavbarWrapperProps) {
    return locale === 'ru' ? <NavbarRu /> : <NavbarKk />;
}


