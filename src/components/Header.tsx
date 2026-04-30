"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

interface HeaderProps {
  onSearch: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const navLinks = [
    { href: "/", label: "Mercados" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/historico", label: "Historico" },
    { href: "/ranking", label: "Ranking" },
  ];

  return (
    <header className="bg-[#0a0a0f]/95 backdrop-blur-md border-b border-amber-500/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center relative">
                <span className="text-white font-bold text-lg">P</span>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-[#0a0a0f]"></span>
              </div>
              <h1 className="text-xl font-bold text-white">
                Predict<span className="text-red-500">Cam</span>
              </h1>
            </Link>
          </div>

          {/* Search */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-md mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar cameras, cidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141419] text-white placeholder-gray-500 rounded-xl px-4 py-2.5 pl-10 border border-[#252530] focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />
              <svg
                className="absolute left-3 top-3 h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* Nav Links */}
          <nav className="flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-gray-400 hover:text-white hover:bg-[#141419]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth */}
            {status === "loading" ? (
              <div className="w-20 h-9 bg-[#141419] rounded-lg animate-pulse ml-2"></div>
            ) : session ? (
              <div className="flex items-center gap-2 ml-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141419] rounded-xl border border-[#252530]">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                    {session.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm text-gray-300">
                    {session.user?.name?.split(" ")[0]}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-gray-500 hover:text-amber-400 text-sm px-2 py-1 transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-amber-500/20"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
