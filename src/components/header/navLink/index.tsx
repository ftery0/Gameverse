import { navLinks } from "@/constants/nav/nav.constants";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NavLinks = () => {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex space-x-8 z-20">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`font-medium ${
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

export default NavLinks  