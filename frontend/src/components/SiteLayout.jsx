import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Phone, MapPin, CalendarDays, Menu, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/#cabinet", label: "Le cabinet" },
  { href: "/#soins", label: "Soins" },
  { href: "/#infos", label: "Infos pratiques" },
  { href: "/#contact", label: "Contact" },
];

function scrollToHash(hash) {
  if (!hash) return;
  const el = document.querySelector(hash);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export const SiteLayout = ({
  practiceName,
  phoneE164,
  phoneDisplay,
  address,
  appointmentLabel = "Prendre rendez-vous",
  onAppointment,
}) => {
  const location = useLocation();

  React.useEffect(() => {
    // Smooth hash navigation (including when arriving from other routes).
    const hash = location.hash;
    if (!hash) return;
    const t = setTimeout(() => scrollToHash(hash), 80);
    return () => clearTimeout(t);
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_20%_0%,rgba(37,99,235,0.08),transparent_55%),radial-gradient(900px_500px_at_90%_12%,rgba(14,165,233,0.10),transparent_55%)]">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="group inline-flex items-baseline gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/50 focus-visible:ring-offset-4"
            >
              <span className="text-[15px] font-semibold tracking-tight text-slate-900">
                {practiceName}
              </span>
              <Badge
                variant="secondary"
                className="hidden border border-slate-200 bg-white/70 text-slate-700 md:inline-flex"
              >
                Seysses
              </Badge>
            </Link>
            <span className="hidden text-sm text-slate-500 md:inline">
              Chirurgien-Dentiste
            </span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <NavigationMenu>
              <NavigationMenuList className="gap-6">
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      href={item.href}
                      className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900"
                      onClick={(e) => {
                        // handle in-page scroll on home
                        if (item.href.startsWith("/#")) {
                          e.preventDefault();
                          if (location.pathname !== "/") {
                            window.location.href = item.href;
                          } else {
                            scrollToHash(item.href.replace("/", ""));
                          }
                        }
                      }}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="ghost"
              className="gap-2 text-slate-700 hover:bg-slate-900 hover:text-white"
              asChild
            >
              <a href={`tel:${phoneE164}`} aria-label="Appeler le cabinet">
                <Phone className="h-4 w-4" />
                {phoneDisplay}
              </a>
            </Button>
            <Button
              className="gap-2 bg-slate-900 text-white hover:bg-slate-800"
              onClick={onAppointment}
            >
              <CalendarDays className="h-4 w-4" />
              Prendre rendez-vous
            </Button>
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 p-0 text-slate-800 hover:bg-slate-900 hover:text-white"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px]">
                <SheetHeader>
                  <SheetTitle className="text-left text-slate-900">
                    Navigation
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white/70 p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-slate-600" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          Adresse
                        </div>
                        <div className="text-sm text-slate-600">{address}</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        asChild
                      >
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            address,
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Itinéraire
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        onClick={(e) => {
                          if (item.href.startsWith("/#")) {
                            e.preventDefault();
                            if (location.pathname !== "/") {
                              window.location.href = item.href;
                            } else {
                              scrollToHash(item.href.replace("/", ""));
                            }
                          }
                        }}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button
                      className="w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"
                      onClick={onAppointment}
                    >
                      <CalendarDays className="h-4 w-4" />
                      Prendre rendez-vous
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      asChild
                    >
                      <a href={`tel:${phoneE164}`}>
                        <Phone className="h-4 w-4" />
                        Appeler
                      </a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-slate-200/70 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3 md:px-6">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-900">
              {practiceName}
            </div>
            <div className="text-sm text-slate-600">Chirurgien-Dentiste</div>
            <div className="text-sm text-slate-600">{address}</div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-900">Contact</div>
            <a
              className="inline-flex items-center gap-2 text-sm text-slate-700 underline-offset-4 hover:underline"
              href={`tel:${phoneE164}`}
            >
              <Phone className="h-4 w-4" />
              {phoneDisplay}
            </a>
            <div className="text-xs text-slate-500">
              Pour un rendez-vous, le bouton « Prendre rendez-vous » est à
              configurer.
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-900">
              Informations
            </div>
            <Link
              to="/mentions-legales"
              className="text-sm text-slate-700 underline-offset-4 hover:underline"
            >
              Mentions légales & confidentialité
            </Link>
            <div className="text-xs text-slate-500">
              Site vitrine — contenus modifiables et évolutifs.
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/70 bg-white/70">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-xs text-slate-500 md:px-6">
            <span>© {new Date().getFullYear()} {practiceName}</span>
            <span className="hidden md:inline">Seysses (31600)</span>
          </div>
        </div>
      </footer>

      {/* Mobile quick call button */}
      <div className="fixed bottom-5 left-4 z-50 md:hidden">
        <Button
          className="h-11 gap-2 rounded-full bg-slate-900 px-4 text-white shadow-lg shadow-slate-900/15 hover:bg-slate-800"
          asChild
        >
          <a href={`tel:${phoneE164}`} aria-label="Appeler le cabinet">
            <Phone className="h-4 w-4" />
            Appeler
          </a>
        </Button>
      </div>
    </div>
  );
};
