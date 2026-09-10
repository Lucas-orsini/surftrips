"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";

export function SearchField({
  label,
  value,
  icon,
  open,
  onToggle,
  onClose,
  children,
  className = "",
}: {
  label: string;
  value: string;
  icon: IconName;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const pointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) onClose();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", pointer);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", pointer);
      document.removeEventListener("keydown", key);
    };
  }, [open, onClose]);
  return (
    <div
      className={`search-field ${open ? "is-open" : ""} ${className}`}
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onClose();
      }}
    >
      <button
        className="field-trigger"
        type="button"
        ref={trigger}
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
      >
        <Icon name={icon} size={21} />
        <span className="field-text">
          <span className="field-label">{label}</span>
          <span className="field-value">{value}</span>
        </span>
        <Icon className="field-chevron" name="chevron" size={16} />
      </button>
      {open && (
        <div className="field-popover" id={id}>
          <div className="popover-heading">
            <span>{label}</span>
            <button
              type="button"
              className="icon-button"
              aria-label={`Fermer ${label.toLowerCase()}`}
              onClick={() => {
                onClose();
                trigger.current?.focus();
              }}
            >
              <Icon name="close" size={17} />
            </button>
          </div>
          {children}
        </div>
      )}
    </div>
  );
}
