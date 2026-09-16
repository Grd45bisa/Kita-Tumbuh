import React from "react";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

export function Container({
  as: Component = "div",
  children,
  className = "",
  style,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={`container ${className}`.trim()}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}
