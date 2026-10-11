"use client";

import { useState } from "react";

export function TextInput({
  name,
  placeholder,
  className,
  type = "text",
}: {
  name: string;
  placeholder?: string;
  className?: string;
  type?: string;
}) {
  const [value, setValue] = useState("");
  return (
    <input
      name={name}
      type={type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}

export function TextArea({
  name,
  placeholder,
  className,
  rows = 3,
}: {
  name: string;
  placeholder?: string;
  className?: string;
  rows?: number;
}) {
  const [value, setValue] = useState("");
  return (
    <textarea
      name={name}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={className}
    />
  );
}
