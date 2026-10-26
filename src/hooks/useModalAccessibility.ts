import { useEffect, useRef, type RefObject } from "react";

export interface ModalAccessibilityOptions<T extends HTMLElement = HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  modalRef?: RefObject<T>;
}

/**
 * Accessible Modal and Dialog hook.
 * Supports both:
 *   useModalAccessibility({ isOpen, onClose, modalRef })
 *   useModalAccessibility(isOpen, onClose, modalRef)
 *
 * Enforces:
 * 1. Body scroll lock during modal visibility
 * 2. Escape key dismissal
 * 3. Keyboard Tab/Shift-Tab focus trapping
 * 4. Automatic initial focus on first interactive control
 * 5. Restoration of focus to trigger element upon closing
 */
export function useModalAccessibility<T extends HTMLElement = HTMLDivElement>(
  isOpenOrOptions: boolean | ModalAccessibilityOptions<T>,
  onCloseArg?: () => void,
  externalRefArg?: RefObject<T>
): RefObject<T> {
  const isObject = typeof isOpenOrOptions === "object" && isOpenOrOptions !== null;
  const isOpen = isObject ? isOpenOrOptions.isOpen : Boolean(isOpenOrOptions);
  const onClose = isObject ? isOpenOrOptions.onClose : (onCloseArg || (() => {}));
  const externalRef = isObject ? isOpenOrOptions.modalRef : externalRefArg;

  const fallbackRef = useRef<T>(null);
  const containerRef = externalRef || fallbackRef;
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Capture currently focused element before modal opens
    triggerRef.current = document.activeElement as HTMLElement | null;

    // Lock body scroll
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto-focus initial element
    const timeoutId = window.setTimeout(() => {
      if (containerRef.current) {
        const focusable = containerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        } else if (typeof containerRef.current.focus === "function") {
          containerRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key === "Tab" && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      // Restore focus to trigger
      if (triggerRef.current && typeof triggerRef.current.focus === "function") {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, containerRef]);

  return containerRef;
}
