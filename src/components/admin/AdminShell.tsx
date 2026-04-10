"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { AdminThemeToggle } from "@/components/admin/AdminThemeToggle";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { API_ROUTES, ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
    ChevronRight,
    LayoutDashboard,
    Layers3,
    LogOut,
    Package,
} from "lucide-react";

const navItems = [
    {
        label: "Dashboard",
        description: "Genel durum ve hızlı yönetim",
        href: ROUTES.yonetim,
        icon: LayoutDashboard,
    },
    {
        label: "Ürünler",
        description: "Katalog, sihirbaz ve düzenleme akışları",
        href: ROUTES.yonetimUrunler,
        icon: Package,
    },
    {
        label: "Varyasyonlar",
        description: "Varyasyon grupları ve değer kümeleri",
        href: ROUTES.yonetimVaryasyonlar,
        icon: Layers3,
    },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await fetch(API_ROUTES.yonetimOturumCikis, { method: "POST" });
            router.push(ROUTES.yonetimGiris);
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Sidebar className="border-r border-border/60 bg-sidebar/95 backdrop-blur">
                <SidebarContent className="px-3 py-4">
                    <SidebarGroup className="p-0">
                        <SidebarGroupLabel className="px-1 text-[11px] uppercase tracking-[0.22em] text-sidebar-foreground/45">
                            Yönetim Paneli
                        </SidebarGroupLabel>
                        <SidebarMenu className="mt-2 space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive =
                                    item.href === ROUTES.yonetim
                                        ? pathname === item.href
                                        : pathname === item.href ||
                                          pathname.startsWith(`${item.href}/`);

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            className={cn(
                                                "h-auto rounded-2xl border px-0 py-0 transition-all",
                                                isActive
                                                    ? "border-primary/30 bg-primary/10 shadow-sm"
                                                    : "border-transparent bg-transparent hover:border-sidebar-border hover:bg-sidebar-accent/40",
                                            )}
                                            render={
                                                <Link
                                                    href={item.href}
                                                    className="flex w-full items-center gap-3 px-3 py-3"
                                                >
                                                    <div
                                                        className={cn(
                                                            "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                                                            isActive
                                                                ? "border-primary/25 bg-primary text-primary-foreground"
                                                                : "border-sidebar-border/70 bg-sidebar-accent/50 text-sidebar-foreground/70",
                                                        )}
                                                    >
                                                        <Icon className="size-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-sidebar-foreground">
                                                            {item.label}
                                                        </p>
                                                        <p className="truncate text-xs text-sidebar-foreground/60">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                    <ChevronRight
                                                        className={cn(
                                                            "size-4 shrink-0 text-sidebar-foreground/40 transition-transform",
                                                            isActive
                                                                ? "translate-x-0.5 text-sidebar-foreground/70"
                                                                : "",
                                                        )}
                                                    />
                                                </Link>
                                            }
                                        />
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarSeparator className="mx-4" />

                <SidebarFooter className="gap-3 p-4">
                    <div className="rounded-3xl border border-sidebar-border/70 bg-sidebar-accent/35 p-3">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-sidebar-foreground/45">
                            Görünüm
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="text-xs text-sidebar-foreground/65">
                                Tema Seçimi
                            </div>
                            <AdminThemeToggle />
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        disabled={loading}
                        className="h-11 w-full justify-between rounded-2xl border-sidebar-border/70 bg-sidebar-accent/20 text-sidebar-foreground hover:bg-sidebar-accent/45"
                    >
                        <span>
                            {loading ? "Cikis yapiliyor" : "Oturumu kapat"}
                        </span>
                        <LogOut className="size-4" />
                    </Button>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset>
                <header className="sticky top-0 z-20 border-b border-border/60 bg-background/88 px-4 py-3 backdrop-blur">
                    <SidebarTrigger />
                </header>

                <main className="flex-1 overflow-auto">
                    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </>
    );
}
