"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { Drawer } from "@/components/Drawer";
import { Shell, type NavItem } from "@/components/Shell";

type DrawerContentProps = { onRequestClose?: () => void };

function countActiveFilters(params: URLSearchParams): number {
  const start = params.get("start");
  const end = params.get("end");
  const hasPeriod = Boolean(start || end);
  const state = params.get("state");
  const category = params.get("category");
  const seller = params.get("seller");
  const status = params.get("status");

  return [
    hasPeriod ? "period" : null,
    state,
    category,
    seller,
    status,
  ].filter(Boolean).length;
}

export function ShellWithDrawer({
  title,
  subtitle,
  badges,
  nav,
  top,
  panels,
  drawerTitle,
  drawerContent,
}: {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  badges: readonly string[];
  nav: readonly NavItem[];
  top?: React.ReactNode;
  panels?: ReadonlyArray<{ id: string; content: React.ReactNode }>;
  drawerTitle: string;
  drawerContent: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const searchParams = useSearchParams();
  const filterCount = React.useMemo(
    () => countActiveFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const content = React.useMemo(() => {
    if (!React.isValidElement(drawerContent)) return drawerContent;
    return React.cloneElement(drawerContent as React.ReactElement<DrawerContentProps>, {
      onRequestClose: () => setOpen(false),
    });
  }, [drawerContent]);

  return (
    <>
      <Shell
        title={title}
        subtitle={subtitle}
        badges={badges}
        nav={nav}
        top={top}
        panels={panels}
        onFilterClick={() => setOpen(true)}
        filterCount={filterCount}
      />
      <Drawer open={open} title={drawerTitle} onOpenChange={setOpen}>
        {content}
      </Drawer>
    </>
  );
}
