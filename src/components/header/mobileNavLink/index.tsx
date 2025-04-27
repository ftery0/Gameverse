"use client";

import { navLinks } from "@/constants/nav/nav.constants";
import { usePathname } from "next/navigation";
import Link from "next/link";

const MobileNavLinks = ({ toggleMenu }: { toggleMenu: () => void }) => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col px-4 py-2 space-y-2">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={toggleMenu}
          className={`block py-2 font-medium ${
            pathname === link.href
              ? "text-blue-600 font-bold"
              : "text-gray-700 hover:text-blue-600"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default MobileNavLinks;
