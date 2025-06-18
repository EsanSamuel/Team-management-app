"use client";

import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const showPath = () => {
    if (pathname === "/dashboard") {
      return "";
    } else if (pathname.includes("/settings")) {
      return "Settings";
    } else if (pathname.includes("/project/")) {
      return "Project";
    } else if (pathname.includes("/members")) {
      return "Members";
    } else if (pathname.includes("/Tasks")) {
      return "Tasks";
    }
  };
  return (
    <>
      <Breadcrumb className="w-full">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {showPath() !== "" ? <BreadcrumbSeparator /> : ""}
          <BreadcrumbItem>
            <BreadcrumbPage>{showPath()}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
