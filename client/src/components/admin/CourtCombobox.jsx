import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { SpinnerCustom } from "../ui/spinner";

export default function CourtCombobox({
  items,
  value,
  onChange,
  placeholder = "Select a court",
  disabled = false,
  loading = false,
  emptyMessage = "No courts found.",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedItem = useMemo(
    () => items.find((item) => item.id === value) || null,
    [items, value],
  );

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return items;
    }

    return items.filter((item) =>
      item.label.toLowerCase().includes(search),
    );
  }, [items, query]);

  const inputValue = open ? query : selectedItem?.label || "";

  const handleSelect = (item) => {
    onChange(item.id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <Input
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          if (!open) {
            setOpen(true);
          }
          setQuery(event.target.value);
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
      />

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-md border bg-background shadow-sm">
          <div className="max-h-56 overflow-auto py-1 text-sm">
            {loading ? (
              <div className="px-3 py-2 text-muted-foreground">
                <SpinnerCustom />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="px-3 py-2 text-muted-foreground">{emptyMessage}</div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(item)}
                >
                  <span>{item.label}</span>
                  {item.subtitle && (
                    <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
