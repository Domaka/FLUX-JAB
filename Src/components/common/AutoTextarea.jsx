import React from "react";
import { Textarea } from "@/components/ui/textarea";

export default function AutoTextarea({ value = "", onChange, placeholder = "", maxLength = 100000, className = "" }) {
  const ref = React.useRef(null);
  const handle = (e) => {
    if (onChange) onChange(e);
    autosize();
  };
  const autosize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };
  React.useEffect(() => { autosize(); }, [value]);
  return (
    <Textarea
      ref={ref}
      placeholder={placeholder}
      value={value}
      onChange={handle}
      maxLength={maxLength}
      className={`resize-none min-h-32 ${className}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) return; // allow newline normally
      }}
    />
  );
}