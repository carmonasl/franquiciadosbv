"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    const newState = !isOpen;
    setIsOpen(newState);

    // Toggle mobile nav visibility
    const mobileNav = document.getElementById("mobile-nav");
    if (mobileNav) {
      if (newState) {
        mobileNav.classList.remove("hidden");
      } else {
        mobileNav.classList.add("hidden");
      }
    }
  };

  // Listen for navigation events to close menu
  useEffect(() => {
    const handleCloseMobileMenu = () => {
      setIsOpen(false);
      const mobileNav = document.getElementById("mobile-nav");
      if (mobileNav) {
        mobileNav.classList.add("hidden");
      }
    };

    // Listen for custom event from mobile nav links
    window.addEventListener("closeMobileMenu", handleCloseMobileMenu);

    // Listen for route changes (Next.js navigation)
    window.addEventListener("beforeunload", handleCloseMobileMenu);

    return () => {
      window.removeEventListener("closeMobileMenu", handleCloseMobileMenu);
      window.removeEventListener("beforeunload", handleCloseMobileMenu);
    };
  }, []);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleMenu}
      className="p-2 hover:bg-gray-100"
      aria-label="Toggle mobile menu"
    >
      {isOpen ? (
        <X className="h-5 w-5 text-gray-600" />
      ) : (
        <Menu className="h-5 w-5 text-gray-600" />
      )}
    </Button>
  );
}
