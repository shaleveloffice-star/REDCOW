"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useLocale, useTranslations } from "@/components/providers/locale-provider";

import "./birth-date-calendar.css";

type BirthDatePickerProps = {
  name: string;
  disabled?: boolean;
  label: string;
  showLabel?: boolean;
};

type CalendarView = "days" | "years";

const MIN_BIRTH_YEAR = 1940;

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function isFutureDate(year: number, month: number, day: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const candidate = new Date(year, month - 1, day);
  candidate.setHours(0, 0, 0, 0);
  return candidate > today;
}

function isFutureMonth(year: number, month: number) {
  const today = new Date();
  return year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth() + 1);
}

function getNextMonth(year: number, month: number) {
  if (month === 12) {
    return { year: year + 1, month: 1 };
  }
  return { year, month: month + 1 };
}

function getPreviousMonth(year: number, month: number) {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
}

function formatDisplayDate(year: number, month: number, day: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(year, month - 1, day));
}

export function BirthDatePicker({
  name,
  disabled = false,
  label,
  showLabel = true
}: BirthDatePickerProps) {
  const { locale } = useLocale();
  const t = useTranslations();
  const fieldId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const [isOpen, setIsOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<CalendarView>("days");
  const [viewYear, setViewYear] = useState(currentYear - 25);
  const [viewMonth, setViewMonth] = useState(1);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const isoValue =
    selectedYear && selectedMonth && selectedDay
      ? toIsoDate(selectedYear, selectedMonth, selectedDay)
      : "";

  const displayValue =
    selectedYear && selectedMonth && selectedDay
      ? formatDisplayDate(selectedYear, selectedMonth, selectedDay, locale)
      : "";

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
    const start = new Date(2024, 0, 7);
    return Array.from({ length: 7 }, (_, index) =>
      formatter.format(new Date(start.getFullYear(), start.getMonth(), start.getDate() + index))
    );
  }, [locale]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { month: "long" }).format(
        new Date(viewYear, viewMonth - 1, 1)
      ),
    [locale, viewMonth, viewYear]
  );

  const yearOptions = useMemo(
    () =>
      Array.from({ length: currentYear - MIN_BIRTH_YEAR + 1 }, (_, index) => currentYear - index),
    [currentYear]
  );

  const calendarDays = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth - 1, 1).getDay();
    const totalDays = daysInMonth(viewYear, viewMonth);
    const cells: Array<{ day: number | null; key: string }> = [];

    for (let index = 0; index < firstWeekday; index += 1) {
      cells.push({ day: null, key: `empty-${index}` });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      cells.push({ day, key: `day-${day}` });
    }

    return cells;
  }, [viewMonth, viewYear]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setCalendarView("days");
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setCalendarView("days");
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const openCalendar = () => {
    if (disabled) return;

    if (selectedYear && selectedMonth) {
      setViewYear(selectedYear);
      setViewMonth(selectedMonth);
    } else {
      setViewYear(currentYear - 25);
      setViewMonth(1);
    }

    setCalendarView("days");
    setIsOpen(true);
  };

  const nextMonthView = getNextMonth(viewYear, viewMonth);
  const previousMonthView = getPreviousMonth(viewYear, viewMonth);
  const canGoNextMonth = !isFutureMonth(nextMonthView.year, nextMonthView.month);
  const canGoPreviousMonth = previousMonthView.year >= MIN_BIRTH_YEAR;

  const goToPreviousMonth = () => {
    if (!canGoPreviousMonth) return;
    setViewYear(previousMonthView.year);
    setViewMonth(previousMonthView.month);
  };

  const goToNextMonth = () => {
    if (!canGoNextMonth) return;
    setViewYear(nextMonthView.year);
    setViewMonth(nextMonthView.month);
  };

  const handleDaySelect = (day: number) => {
    if (isFutureDate(viewYear, viewMonth, day)) return;

    setSelectedYear(viewYear);
    setSelectedMonth(viewMonth);
    setSelectedDay(day);
    setIsOpen(false);
    setCalendarView("days");
  };

  const handleYearSelect = (year: number) => {
    setViewYear(year);
    setCalendarView("days");

    if (isFutureMonth(year, viewMonth)) {
      setViewMonth(currentMonth);
    }
  };

  return (
    <div className="birth-date-picker" ref={rootRef}>
      {showLabel ? (
        <span id={`${fieldId}-label`} className="birth-date-picker-label">
          {label}
        </span>
      ) : null}

      <input type="hidden" name={name} value={isoValue} />

      <button
        type="button"
        className={[
          "birth-date-picker-trigger",
          displayValue ? "birth-date-picker-trigger--filled" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={openCalendar}
      >
        {displayValue || label}
      </button>

      {isOpen ? (
        <div
          className="birth-date-calendar"
          role="dialog"
          aria-label={label}
          {...(showLabel ? { "aria-labelledby": `${fieldId}-label` } : {})}
        >
          <div className="birth-date-calendar-header">
            <button
              type="button"
              className="birth-date-calendar-nav"
              aria-label={t.customerClub.datePicker.prevMonth}
              disabled={!canGoPreviousMonth || calendarView === "years"}
              onClick={goToPreviousMonth}
            >
              <ChevronRight strokeWidth={1.75} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="birth-date-calendar-title"
              onClick={() => setCalendarView(calendarView === "days" ? "years" : "days")}
            >
              {calendarView === "days" ? `${monthLabel} ${viewYear}` : t.customerClub.datePicker.pickYear}
            </button>

            <button
              type="button"
              className="birth-date-calendar-nav"
              aria-label={t.customerClub.datePicker.nextMonth}
              disabled={!canGoNextMonth || calendarView === "years"}
              onClick={goToNextMonth}
            >
              <ChevronLeft strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          {calendarView === "days" ? (
            <>
              <div className="birth-date-calendar-weekdays" aria-hidden="true">
                {weekdayLabels.map((weekday) => (
                  <span key={weekday}>{weekday}</span>
                ))}
              </div>

              <div className="birth-date-calendar-grid" role="grid">
                {calendarDays.map((cell) => {
                  if (cell.day === null) {
                    return <span key={cell.key} className="birth-date-calendar-day birth-date-calendar-day--empty" />;
                  }

                  const isSelected =
                    selectedYear === viewYear &&
                    selectedMonth === viewMonth &&
                    selectedDay === cell.day;
                  const isDisabled = isFutureDate(viewYear, viewMonth, cell.day);

                  return (
                    <button
                      key={cell.key}
                      type="button"
                      role="gridcell"
                      className={[
                        "birth-date-calendar-day",
                        isSelected ? "birth-date-calendar-day--selected" : "",
                        isDisabled ? "birth-date-calendar-day--disabled" : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      disabled={isDisabled}
                      onClick={() => handleDaySelect(cell.day!)}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="birth-date-calendar-years" role="listbox" aria-label={t.customerClub.datePicker.year}>
              {yearOptions.map((year) => (
                <button
                  key={year}
                  type="button"
                  role="option"
                  aria-selected={viewYear === year}
                  className={[
                    "birth-date-calendar-year",
                    viewYear === year ? "birth-date-calendar-year--selected" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleYearSelect(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
