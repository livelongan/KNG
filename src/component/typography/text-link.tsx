import { Link, type LinkProps } from "@mui/material";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";

export type TextLinkProps = LinkProps & {
  children: ReactNode;
  replaceClassName?: boolean;
};

const shouldOpenInNewTab = (href: LinkProps["href"]): boolean => {
  if (typeof href !== "string" || !href) {
    return false;
  }

  if (typeof window === "undefined") {
    return false;
  }

  try {
    const resolvedUrl = new URL(href, window.location.href);

    if (!["http:", "https:"].includes(resolvedUrl.protocol)) {
      return false;
    }

    return resolvedUrl.origin !== window.location.origin;
  } catch {
    return false;
  }
};

export const TextLink = observer(
  ({
    children,
    className,
    href,
    target,
    replaceClassName,
    ...props
  }: TextLinkProps) => {
    const mergedClass =
      !replaceClassName && className
        ? `link-normal ${className}`.trim()
        : className;
    const resolvedTarget =
      target ?? (shouldOpenInNewTab(href) ? "_blank" : "_self");

    return (
      <Link
        className={mergedClass}
        href={href}
        referrerPolicy="no-referrer"
        rel="noopener noreferrer"
        target={resolvedTarget}
        {...props}
      >
        {children}
      </Link>
    );
  },
);
