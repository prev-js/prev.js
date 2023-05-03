import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export interface HeadProps {
  children: ReactNode;
  key?: string;
}

export function Head({ children, key }: HeadProps) {
  return createPortal(children, document.head, key);
}
