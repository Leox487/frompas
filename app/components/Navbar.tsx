"use client";

import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  return (
    <header className="navbar">
      <Link href="/" className="navbar-logo">
        Frompas
      </Link>
      <nav className="navbar-actions" aria-label="Main">
        {!isLoaded ? (
          <span className="navbar-placeholder" aria-hidden />
        ) : isSignedIn ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            Sign out
          </button>
        ) : (
          <>
            <Link href="/sign-in" className="navbar-link">
              Sign in
            </Link>
            <Link href="/sign-up" className="btn btn-primary">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
