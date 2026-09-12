import type { CSSProperties, ReactNode } from "react";
import type { Design } from "@/types";

const radiusMap = {
  none: "0px",
  sm: "8px",
  md: "14px",
  lg: "20px",
  full: "999px",
};

const buttonRadius = {
  rounded: "14px",
  pill: "999px",
  square: "4px",
};

export function ThemeFrame({
  design,
  children,
  className,
}: {
  design: Design;
  children: ReactNode;
  className?: string;
}) {
  const style = {
    "--p": design.primaryColor,
    "--s": design.secondaryColor,
    "--a": design.accentColor || "#C9A227",
    "--radius": radiusMap[design.borderRadius],
    "--btn-radius": buttonRadius[design.buttonStyle],
    fontFamily: `"${design.font}", sans-serif`,
  } as CSSProperties;

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}
