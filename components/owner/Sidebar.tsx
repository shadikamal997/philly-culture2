"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/owner", label: "Overview" },
    { href: "/owner/courses", label: "Courses" },
    { href: "/owner/tools", label: "Tools" },
    { href: "/owner/orders", label: "Orders" },
    { href: "/owner/revenue", label: "Revenue" },
  ];

  if (role === "owner") {
    links.push({ href: "/owner/assistants", label: "Assistants" });
  }

  return (
    <aside className="w-64 border-r bg-white p-6">
      <h2 className="text-lg font-semibold mb-8">Owner Panel</h2>

      <nav className="space-y-2 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-lg px-3 py-2 transition ${
              pathname === link.href
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
