import { ComponentProps } from "react";
import { Link } from "wasp/client/router";
import {
  Button as ShadcnButton,
  buttonVariants,
} from "../../components/ui/button";
import { cn } from "../../lib/utils";

type ButtonSize = "md" | "sm" | "xs";
type ButtonVariant = "primary" | "danger" | "ghost";

const sizeMap = {
  md: "default",
  sm: "sm",
  xs: "xs",
} as const;

const variantMap = {
  primary: "default",
  danger: "destructive",
  ghost: "ghost",
} as const;

interface ButtonProps extends Omit<
  ComponentProps<typeof ShadcnButton>,
  "size" | "variant"
> {
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export function Button({
  size = "md",
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <ShadcnButton
      size={sizeMap[size]}
      variant={variantMap[variant]}
      className={className}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function ButtonLink({
  children,
  className,
  size = "md",
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        buttonVariants({
          size: sizeMap[size],
          variant: variantMap[variant],
        }),
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
