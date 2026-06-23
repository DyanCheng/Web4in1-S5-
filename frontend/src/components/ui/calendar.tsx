"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 select-none", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-semibold text-slate-900 dark:text-slate-100",
        nav: "absolute inset-x-0 top-1 flex justify-between items-center px-1 pointer-events-none",
        button_previous:
          "pointer-events-auto flex items-center justify-center size-7 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm",
        button_next:
          "pointer-events-auto flex items-center justify-center size-7 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-slate-500 dark:text-slate-400 rounded-md w-9 font-medium text-[0.75rem] text-center pb-1",
        weeks: "mt-2",
        week: "flex w-full mt-1",
        day: "relative w-9 h-9 p-0 text-center text-sm flex items-center justify-center [&:has([aria-selected].rdp-range_end)]:rounded-r-md [&:has([aria-selected].rdp-range_start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button:
          "size-9 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 aria-selected:opacity-100 disabled:pointer-events-none disabled:opacity-35 disabled:text-slate-400 dark:disabled:text-slate-600",
        selected:
          "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
        today:
          "bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-50",
        outside:
          "text-slate-400 dark:text-slate-600 opacity-40 aria-selected:bg-blue-100/50 aria-selected:text-slate-400",
        disabled:
          "text-slate-400 dark:text-slate-600 opacity-35 pointer-events-none",
        range_start:
          "rdp-range_start bg-blue-600 text-white rounded-l-md rounded-r-none",
        range_end:
          "rdp-range_end bg-blue-600 text-white rounded-r-md rounded-l-none",
        range_middle:
          "rdp-range_middle bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) => {
          if (orientation === "left") {
            return <ChevronLeft className="size-4" {...rest} />;
          }
          return <ChevronRight className="size-4" {...rest} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
