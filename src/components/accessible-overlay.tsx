"use client";

import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function focusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => {
    if (
      element.matches(":disabled") ||
      element.tabIndex < 0 ||
      element.matches('input[type="hidden"]') ||
      element.closest("[inert]")
    ) {
      return false;
    }

    let current: HTMLElement | null = element;
    while (current && root.contains(current)) {
      if (current.hidden || current.getAttribute("aria-hidden") === "true") {
        return false;
      }
      const style = window.getComputedStyle(current);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.visibility === "collapse"
      ) {
        return false;
      }
      if (current === root) break;
      current = current.parentElement;
    }
    return true;
  });
}

export function AccessibleOverlay({
  open,
  id,
  label,
  className,
  returnFocusRef,
  onClose,
  children,
}: {
  open: boolean;
  id: string;
  label: string;
  className: string;
  returnFocusRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const overlay = overlayRef.current;
    if (!overlay) return;
    const activeOverlay: HTMLDivElement = overlay;
    const opener = returnFocusRef.current;

    const controls = focusableElements(activeOverlay);
    const initialTarget = controls[0] ?? activeOverlay;
    initialTarget.focus();

    let redirectingFocus = false;
    function handleFocusIn(event: FocusEvent) {
      if (
        redirectingFocus ||
        (event.target instanceof Node && activeOverlay.contains(event.target))
      ) {
        return;
      }

      const currentControls = focusableElements(activeOverlay);
      const target = currentControls.includes(initialTarget)
        ? initialTarget
        : (currentControls[0] ?? activeOverlay);
      redirectingFocus = true;
      target.focus();
      redirectingFocus = false;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const currentControls = focusableElements(activeOverlay);
      if (currentControls.length === 0) {
        event.preventDefault();
        activeOverlay.focus();
        return;
      }

      const first = currentControls[0];
      const last = currentControls[currentControls.length - 1];
      const active = document.activeElement;
      const activeIndex = currentControls.indexOf(active as HTMLElement);

      if (currentControls.length === 1) {
        event.preventDefault();
        first.focus();
      } else if (activeIndex === -1) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      const active = document.activeElement;
      if (active instanceof HTMLElement && activeOverlay.contains(active)) {
        active.blur();
      }
      if (opener?.isConnected) {
        opener.focus();
      }
    };
  }, [onClose, open, returnFocusRef]);

  if (!open || typeof document === "undefined") return null;

  function closeOnNavigation(event: ReactMouseEvent<HTMLDivElement>) {
    if ((event.target as Element).closest("a[href]")) {
      onClose();
    }
  }

  return createPortal(
    <div
      ref={overlayRef}
      id={id}
      className={className}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      onClick={closeOnNavigation}
    >
      {children}
    </div>,
    document.body,
  );
}
