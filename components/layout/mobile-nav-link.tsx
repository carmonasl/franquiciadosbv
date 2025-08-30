"use client";

import Link from "next/link";
import { LayoutDashboard, FileText, Newspaper, BarChart3 } from "lucide-react";

interface MobileNavLinkProps {
  href: string;
  name: string;
  iconName: string;
}

const iconMap = {
  LayoutDashboard: LayoutDashboard,
  FileText: FileText,
  Newspaper: Newspaper,
  BarChart3: BarChart3,
};

export function MobileNavLink({ href, name, iconName }: MobileNavLinkProps) {
  const Icon = iconMap[iconName as keyof typeof iconMap];
  const handleClick = () => {
    // Close the mobile menu when a link is clicked
    const mobileNav = document.getElementById("mobile-nav");
    if (mobileNav) {
      mobileNav.classList.add("hidden");
    }

    // Dispatch a custom event to notify the menu button to reset its state
    window.dispatchEvent(new CustomEvent("closeMobileMenu"));
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-[#159a93] transition-colors"
    >
      <Icon className="h-5 w-5 text-gray-400" />
      {name}
    </Link>
  );
}
