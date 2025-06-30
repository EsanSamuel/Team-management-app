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
import { Bell } from "lucide-react";
import { ModeToggle } from "./ModeToggle";

export function Navbar() {
  const pathname = usePathname();

  const showPath = () => {
    if (pathname === "/dashboard") {
      return "";
    } else if (/^\/dashboard\/[^\/]+$/.test(pathname)) {
      return "Home";
    } else if (pathname.includes("/settings")) {
      return "Settings";
    } else if (pathname.includes("/project/")) {
      return "Project";
    } else if (pathname.includes("/members")) {
      return "Members";
    } else if (pathname.includes("/Tasks")) {
      return "Tasks";
    } else if (pathname.includes("/TaskContent")) {
      return "Task";
    } else if (pathname.includes("/notifications")) {
      return "Notifications";
    }
  };
  return (
    <div className="w-full flex justify-between items-center">
      <div className="flex-1">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {showPath() && <BreadcrumbSeparator />}
            {showPath() && (
              <BreadcrumbItem>
                <BreadcrumbPage>{showPath()}</BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div>
        <ModeToggle />
      </div>
    </div>
  );
}
