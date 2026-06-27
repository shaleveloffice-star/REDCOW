"use client";

import { CalendarDays, ChevronRight } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from "react";
import { createPortal } from "react-dom";

import { useLocale, useTranslations } from "@/components/providers/locale-provider";

type BirthDatePickerProps = {
  name: string;
  disabled?: boolean;
  label: string;
};

type PickerStep = 1 | 2 | 3;

const MIN_BIRTH_YEAR = 1940;

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function formatDisplayDate(year: number, month: number, day: number) {
  return `${pad2(day)}/${pad2(month)}/${year}`;
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

export function BirthDatePicker({ name, disabled = false, label }: BirthDatePickerProps) {
  const { locale } = useLocale();
  const t = useTranslations();
  const fieldId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<PickerStep>(1);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});

  const isoValue =
    selectedYear && selectedMonth && selectedDay
      ? toIsoDate(selectedYear, selectedMonth, selectedDay)
      : "";

  const displayValue =
    selectedYear && selectedMonth && selectedDay
      ? formatDisplayDate(selectedYear, selectedMonth, selectedDay)
      : "";

  const years = useMemo(
    () => Array.from({ length: currentYear - MIN_BIRTH_YEAR + 1 }, (_, index) => currentYear - index),
    [currentYear]
  );

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        const labelText = new Intl.DateTimeFormat(locale, { month: "long" }).format(
          new Date(2024, index, 1)
        );
        const disabledMonth =
          selectedYear === currentYear && month > new Date().getMonth() + 1;
        return { month, label: labelText, disabled: disabledMonth };
      }),
    [currentYear, locale, selectedYear]
  );

  const days = useMemo(() => {
    if (!selectedYear || !selectedMonth) return [];

    const totalDays = daysInMonth(selectedYear, selectedMonth);
    return Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1;
      return {
        day,
        disabled: isFutureDate(selectedYear, selectedMonth, day)
      };
    });
  }, [selectedMonth, selectedYear]);

  const stepTitle =
    step === 1
      ? t.customerClub.datePicker.stepYear
      : step === 2
        ? t.customerClub.datePicker.stepMonth
        : t.customerClub.datePicker.stepDay;

  const resetPicker = () => {
    setStep(1);
    setSelectedYear(null);
    setSelectedMonth(null);
    setSelectedDay(null);
  };

  const openPicker = () => {
    if (disabled) return;
    setOpen(true);
    if (!selectedYear) {
      setStep(1);
    } else if (!selectedMonth) {
      setStep(2);
    } else if (!selectedDay) {
      setStep(3);
    } else {
      setStep(1);
    }
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setSelectedMonth(null);
    setSelectedDay(null);
    setStep(2);
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setSelectedDay(null);
    setStep(3);
  };

  const handleDaySelect = (day: number) => {
    if (!selectedYear || !selectedMonth) return;
    setSelectedDay(day);
    setOpen(false);
  };

  const handleBack = () => {
    if (step === 3) {
      setSelectedDay(null);
      setStep(2);
      return;
    }

    if (step === 2) {
      setSelectedMonth(null);
      setSelectedDay(null);
      setStep(1);
    }
  };

  const updatePanelPosition = () => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;

    const margin = 12;
    const gap = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const triggerRect = trigger.getBoundingClientRect();
    const panelHeight = panel.offsetHeight;
    const panelWidth = Math.min(triggerRect.width, viewportWidth - margin * 2);

    let left = triggerRect.left;
    left = Math.max(margin, Math.min(left, viewportWidth - panelWidth - margin));

    const spaceBelow = viewportHeight - triggerRect.bottom - gap - margin;
    const spaceAbove = triggerRect.top - gap - margin;
    const openAbove = panelHeight > spaceBelow && spaceAbove > spaceBelow;

    let top = openAbove ? triggerRect.top - gap - panelHeight : triggerRect.bottom + gap;
    top = Math.max(margin, Math.min(top, viewportHeight - panelHeight - margin));

    setPanelStyle({
      position: "fixed",
      top,
      left,
      width: panelWidth,
      maxHeight: viewportHeight - margin * 2,
      zIndex: 10000
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    const run = () => updatePanelPosition();
    run();
    const frame = window.requestAnimationFrame(run);

    const onReposition = () => updatePanelPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, step, displayValue]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const stepsPanel = (
    <div
      ref={panelRef}
      id={`${fieldId}-steps`}
      className="birth-date-steps birth-date-steps--floating"
      style={panelStyle}
      role="dialog"
      aria-label={t.customerClub.datePicker.dialogLabel}
    >
      <div className="birth-date-steps-progress" aria-hidden="true">
        {[1, 2, 3].map((item) => (
          <span
            key={item}
            className={[
              "birth-date-steps-dot",
              item === step ? "birth-date-steps-dot--active" : "",
              item < step ? "birth-date-steps-dot--done" : ""
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>

      <div className="birth-date-steps-head">
        {step > 1 ? (
          <button type="button" className="birth-date-steps-back" onClick={handleBack}>
            <ChevronRight strokeWidth={1.5} aria-hidden="true" />
            {t.customerClub.datePicker.back}
          </button>
        ) : (
          <span className="birth-date-steps-head-spacer" aria-hidden="true" />
        )}

        <p className="birth-date-steps-title">{stepTitle}</p>

        <span className="birth-date-steps-count">
          {t.customerClub.datePicker.stepCount
            .replace("{current}", String(step))
            .replace("{total}", "3")}
        </span>
      </div>

      <div className="birth-date-steps-scroll">
        {step === 1 ? (
          <div className="birth-date-steps-grid birth-date-steps-grid--years">
            {years.map((year) => (
              <button
                key={year}
                type="button"
                className={[
                  "birth-date-steps-option",
                  selectedYear === year ? "birth-date-steps-option--selected" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleYearSelect(year)}
              >
                {year}
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="birth-date-steps-grid birth-date-steps-grid--months">
            {months.map(({ month, label: monthLabel, disabled: monthDisabled }) => (
              <button
                key={month}
                type="button"
                className={[
                  "birth-date-steps-option",
                  selectedMonth === month ? "birth-date-steps-option--selected" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={monthDisabled}
                onClick={() => handleMonthSelect(month)}
              >
                {monthLabel}
              </button>
            ))}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="birth-date-steps-grid birth-date-steps-grid--days">
            {days.map(({ day, disabled: dayDisabled }) => (
              <button
                key={day}
                type="button"
                className={[
                  "birth-date-steps-option birth-date-steps-option--day",
                  selectedDay === day ? "birth-date-steps-option--selected" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={dayDisabled}
                onClick={() => handleDaySelect(day)}
              >
                {day}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {displayValue ? (
        <button
          type="button"
          className="birth-date-steps-clear"
          onClick={() => {
            resetPicker();
            setOpen(false);
          }}
        >
          {t.customerClub.datePicker.clear}
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="customer-club-field customer-club-field--full birth-date-picker" ref={rootRef}>
      <span id={`${fieldId}-label`}>{label}</span>

      <input type="hidden" name={name} value={isoValue} />

      <div className="birth-date-picker-control">
        <button
          ref={triggerRef}
          type="button"
          id={`${fieldId}-trigger`}
          className="birth-date-picker-trigger-field"
          aria-labelledby={`${fieldId}-label`}
          aria-expanded={open}
          aria-controls={`${fieldId}-steps`}
          disabled={disabled}
          onClick={openPicker}
        >
          <span className={displayValue ? "" : "birth-date-picker-placeholder"}>
            {displayValue || t.customerClub.datePicker.chooseDate}
          </span>
          <CalendarDays strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <p className="birth-date-picker-hint">{t.customerClub.datePicker.stepsHint}</p>

      {mounted && open ? createPortal(stepsPanel, document.body) : null}
    </div>
  );
}
