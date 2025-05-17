"use client";

import React from "react";
import clsx from "clsx";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  width?: string; 
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className,
  width,
}: ButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-semibold transition-colors focus:outline-none cursor-pointer";

  const variantClasses = {
    primary: "bg-blue-400 text-white hover:bg-blue-500 focus:ring-blue-500",
    secondary: "bg-gray-200 text-black hover:bg-gray-300 focus:ring-gray-400",
    danger: "bg-red-400 text-white hover:bg-red-500 focus:ring-red-500",
  };

  const sizeClasses = {
    sm: "h-8 text-sm",   
    md: "h-10 text-base",
    lg: "h-12 text-lg",
  };

  const widthClass = width ?? "w-full"; 

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClass,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
};

