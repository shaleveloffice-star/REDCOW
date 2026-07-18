"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { useLocale, useTranslations } from "@/components/providers/locale-provider";
import { focusElement, getFocusableElements, trapFocus } from "@/lib/a11y/focus-trap";

import "./birth-date-calendar.css";

type BirthDatePickerProps = {
  name: string;
  disabled?: boolean;
  label: string;
  showLabel?: boolean;
  labelledBy?: string;
};

type CalendarView = "days" | "months" | "years";

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
  showLabel = true,
  labelledBy
}: BirthDatePickerProps) {
  const { locale } = useLocale();
  const t = useTranslations();
  const fieldId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

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

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: index + 1,
        label: new Intl.DateTimeFormat(locale, { month: "long" }).format(
          new Date(viewYear, index, 1)
        )
      })),
    [locale, viewYear]
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

  const resetCalendarView = () => {
    setCalendarView("days");
  };

  const closeCalendar = (restoreFocus = true) => {
    setIsOpen(false);
    resetCalendarView();
    if (restoreFocus) {
      focusElement(triggerRef.current);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeCalendar(true);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const preferred =
      dialog.querySelector<HTMLElement>('[aria-selected="true"]:not([disabled])') ??
      dialog.querySelector<HTMLElement>('[aria-current="date"]:not([disabled])') ??
      getFocusableElements(dialog).find((el) => el.classList.contains("birth-date-calendar-day")) ??
      getFocusableElements(dialog)[0];

    focusElement(preferred);
    const releaseTrap = trapFocus(dialog);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeCalendar(true);
        return;
      }

      if (calendarView !== "days") return;

      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || !active.classList.contains("birth-date-calendar-day")) {
        return;
      }

      const day = Number(active.dataset.day);
      if (!Number.isFinite(day)) return;

      const total = daysInMonth(viewYear, viewMonth);
      let nextDay: number | null = null;

      if (event.key === "ArrowRight") nextDay = day - 1;
      if (event.key === "ArrowLeft") nextDay = day + 1;
      if (event.key === "ArrowUp") nextDay = day - 7;
      if (event.key === "ArrowDown") nextDay = day + 7;
      if (event.key === "Home") nextDay = 1;
      if (event.key === "End") nextDay = total;
      if (event.key === "PageUp") {
        event.preventDefault();
        goToPreviousMonth();
        return;
      }
      if (event.key === "PageDown") {
        event.preventDefault();
        goToNextMonth();
        return;
      }

      if (nextDay === null) return;
      if (nextDay < 1 || nextDay > total) return;
      if (isFutureDate(viewYear, viewMonth, nextDay)) return;

      event.preventDefault();
      const nextButton = dialog.querySelector<HTMLElement>(
        `.birth-date-calendar-day[data-day="${nextDay}"]`
      );
      nextButton?.focus();
    };

    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      releaseTrap();
      dialog.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, calendarView, viewYear, viewMonth]);

  const openCalendar = () => {
    if (disabled) return;

    if (selectedYear && selectedMonth) {
      setViewYear(selectedYear);
      setViewMonth(selectedMonth);
    } else {
      setViewYear(currentYear - 25);
      setViewMonth(1);
    }

    resetCalendarView();
    setIsOpen(true);
  };

  const nextMonthView = getNextMonth(viewYear, viewMonth);
  const previousMonthView = getPreviousMonth(viewYear, viewMonth);
  const canGoNextMonth = !isFutureMonth(nextMonthView.year, nextMonthView.month);
  const canGoPreviousMonth = previousMonthView.year >= MIN_BIRTH_YEAR;
  const navDisabled = calendarView !== "days";

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
    closeCalendar(true);
  };

  const handleMonthSelect = (month: number) => {
    if (isFutureMonth(viewYear, month)) return;

    setViewMonth(month);
    resetCalendarView();
  };

  const handleYearSelect = (year: number) => {
    setViewYear(year);

    if (isFutureMonth(year, viewMonth)) {
      setViewMonth(currentMonth);
    }

    resetCalendarView();
  };

  const headerTitle =
    calendarView === "months"
      ? t.customerClub.datePicker.pickMonth
      : calendarView === "years"
        ? t.customerClub.datePicker.pickYear
        : null;

  const labelId = showLabel ? `${fieldId}-label` : labelledBy;

  return (
    <div className="birth-date-picker" ref={rootRef}>
      {showLabel ? (
        <span id={`${fieldId}-label`} className="birth-date-picker-label">
          {label}
        </span>
      ) : null}

      <input type="hidden" name={name} value={isoValue} />

      <button
        ref={triggerRef}
        type="button"
        className={[
          "birth-date-picker-trigger",
          displayValue ? "birth-date-picker-trigger--filled" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={labelId ? undefined : label}
        aria-labelledby={labelId}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? `${fieldId}-dialog` : undefined}
        disabled={disabled}
        onClick={openCalendar}
      >
        {displayValue || label}
      </button>

      {isOpen ? (
        <div
          ref={dialogRef}
          id={`${fieldId}-dialog`}
          className="birth-date-calendar"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          {...(labelId ? { "aria-labelledby": labelId } : {})}
        >
          <div className="birth-date-calendar-header">
            <button
              type="button"
              className="birth-date-calendar-nav"
              aria-label={t.customerClub.datePicker.prevMonth}
              disabled={!canGoPreviousMonth || navDisabled}
              onClick={goToPreviousMonth}
            >
              <ChevronRight strokeWidth={1.75} aria-hidden="true" />
            </button>

            {calendarView === "days" ? (
              <div className="birth-date-calendar-title-group">
                <button
                  type="button"
                  className="birth-date-calendar-title-part"
                  aria-label={t.customerClub.datePicker.pickMonth}
                  onClick={() => setCalendarView("months")}
                >
                  {monthLabel}
                </button>
                <button
                  type="button"
                  className="birth-date-calendar-title-part"
                  aria-label={t.customerClub.datePicker.pickYear}
                  onClick={() => setCalendarView("years")}
                >
                  {viewYear}
                </button>
              </div>
            ) : (
              <p className="birth-date-calendar-heading">{headerTitle}</p>
            )}

            <button
              type="button"
              className="birth-date-calendar-nav"
              aria-label={t.customerClub.datePicker.nextMonth}
              disabled={!canGoNextMonth || navDisabled}
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
                    return (
                      <span
                        key={cell.key}
                        className="birth-date-calendar-day birth-date-calendar-day--empty"
                      />
                    );
                  }

                  const isSelected =
                    selectedYear === viewYear &&
                    selectedMonth === viewMonth &&
                    selectedDay === cell.day;
                  const isToday =
                    viewYear === currentYear &&
                    viewMonth === currentMonth &&
                    cell.day === currentDay;
                  const isDisabled = isFutureDate(viewYear, viewMonth, cell.day);
                  const fullDateLabel = formatDisplayDate(viewYear, viewMonth, cell.day, locale);

                  return (
                    <button
                      key={cell.key}
                      type="button"
                      role="gridcell"
                      data-day={cell.day}
                      className={[
                        "birth-date-calendar-day",
                        isSelected ? "birth-date-calendar-day--selected" : "",
                        isDisabled ? "birth-date-calendar-day--disabled" : ""
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-label={fullDateLabel}
                      aria-selected={isSelected}
                      aria-current={isToday ? "date" : undefined}
                      disabled={isDisabled}
                      onClick={() => handleDaySelect(cell.day!)}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </>
          ) : calendarView === "months" ? (
            <div
              className="birth-date-calendar-months"
              role="listbox"
              aria-label={t.customerClub.datePicker.month}
            >
              {monthOptions.map((month) => {
                const isDisabled = isFutureMonth(viewYear, month.value);
                const isSelected = viewMonth === month.value;

                return (
                  <button
                    key={month.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={[
                      "birth-date-calendar-month",
                      isSelected ? "birth-date-calendar-month--selected" : "",
                      isDisabled ? "birth-date-calendar-month--disabled" : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={isDisabled}
                    onClick={() => handleMonthSelect(month.value)}
                  >
                    {month.label}
                  </button>
                );
              })}
            </div>
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
