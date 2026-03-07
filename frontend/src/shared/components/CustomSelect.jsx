import { useEffect, useMemo, useRef, useState } from "react";

function CustomSelect({
  id,
  name,
  value,
  options,
  onChange,
  disabled = false,
  className = "",
  label,
  size = "default",
  menuClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const selectedIndex = useMemo(() => options.findIndex((option) => option.value === value), [options, value]);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : options[0];

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!open || !listRef.current || selectedIndex < 0) return;
    const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    selectedEl?.scrollIntoView({ block: "nearest" });
  }, [open, selectedIndex]);

  const emitChange = (nextValue) => {
    onChange({ target: { name, value: nextValue, type: "select-one" } });
    setOpen(false);
  };

  const handleButtonKeyDown = (event) => {
    if (disabled) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }

      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = selectedIndex < 0 ? 0 : (selectedIndex + delta + options.length) % options.length;
      emitChange(options[nextIndex].value);
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((prev) => !prev);
    }
  };

  const buttonPadding = size === "compact" ? "px-3 py-2" : "p-3 pt-5";

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={handleButtonKeyDown}
        className={`w-full text-left bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-indigo-400 transition ${buttonPadding} ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
      >
        <span className={`block truncate ${size === "compact" ? "text-sm" : ""}`}>{selected?.label ?? ""}</span>
        <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {label && (
        <label htmlFor={id} className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
          {label}
        </label>
      )}

      {open && (
        <div
          ref={listRef}
          role="listbox"
          aria-labelledby={id}
          className={`custom-scrollbar absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-slate-600 bg-slate-900 shadow-2xl ${menuClassName}`}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;

            return (
              <button
                key={`${option.value}`}
                data-index={index}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => emitChange(option.value)}
                className={`w-full px-3 py-2 text-left text-sm transition ${isSelected ? "bg-indigo-600/20 text-indigo-200" : "text-slate-200 hover:bg-slate-800"}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
