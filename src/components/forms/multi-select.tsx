"use client";

import {
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "cn";

import {
  FieldWrapper,
  type FieldControlProps,
} from "@/components/forms/field-wrapper";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { selectTriggerClassName } from "@/components/ui/select";
import { normalizeSearch } from "@/lib/normalize-search";

export type MultiSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
};

export type MultiSelectProps = {
  options: readonly MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
  placeholder?: string;
  searchable?: boolean;
  max?: number;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
};

const DEFAULT_PLACEHOLDER = "Choisir des options";
const MAX_VISIBLE_CHIPS = 3;

function filterOptions(
  value: string,
  search: string,
  keywords: string[] = [],
): number {
  const needle = normalizeSearch(search);
  if (!needle) return 1;
  const haystack = [value, ...keywords].map(normalizeSearch).join(" ");
  return haystack.includes(needle) ? 1 : 0;
}

function groupOptions(options: readonly MultiSelectOption[]) {
  const ungrouped: MultiSelectOption[] = [];
  const groups = new Map<string, MultiSelectOption[]>();

  for (const option of options) {
    if (!option.group) {
      ungrouped.push(option);
      continue;
    }
    const list = groups.get(option.group) ?? [];
    list.push(option);
    groups.set(option.group, list);
  }

  return { ungrouped, groups };
}

export function MultiSelect({
  options,
  value,
  onChange,
  label,
  placeholder = DEFAULT_PLACEHOLDER,
  searchable = true,
  max,
  hint,
  error,
  disabled = false,
  required = false,
  id,
  className,
}: MultiSelectProps) {
  return (
    <FieldWrapper
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {(control) => (
        <MultiSelectControl
          control={control}
          options={options}
          value={value}
          onChange={onChange}
          label={label}
          placeholder={placeholder}
          searchable={searchable}
          max={max}
          disabled={disabled}
        />
      )}
    </FieldWrapper>
  );
}

type MultiSelectControlProps = {
  control: FieldControlProps;
  options: readonly MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
  placeholder: string;
  searchable: boolean;
  max?: number;
  disabled: boolean;
};

function MultiSelectControl({
  control,
  options,
  value,
  onChange,
  label,
  placeholder,
  searchable,
  max,
  disabled,
}: MultiSelectControlProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentId = `${useId()}-options`;
  const liveId = `${control.id}-selection`;

  const selectedSet = useMemo(() => new Set(value), [value]);
  const optionByValue = useMemo(() => {
    const map = new Map<string, MultiSelectOption>();
    for (const option of options) {
      map.set(option.value, option);
    }
    return map;
  }, [options]);

  const selectedOptions = value
    .map((item) => optionByValue.get(item))
    .filter((option): option is MultiSelectOption => Boolean(option));

  const atMax = max !== undefined && value.length >= max;
  const { ungrouped, groups } = useMemo(() => groupOptions(options), [options]);

  const visibleChips = selectedOptions.slice(0, MAX_VISIBLE_CHIPS);
  const hiddenCount = Math.max(0, selectedOptions.length - MAX_VISIBLE_CHIPS);

  const noun = (label.split(/[\s(]/)[0] ?? label).toLowerCase();
  const liveMessage =
    value.length === 0
      ? `Aucune ${noun} sélectionnée`
      : value.length === 1
        ? `1 ${noun} sélectionnée`
        : `${value.length} ${noun} sélectionnées`;

  function toggle(optionValue: string) {
    if (selectedSet.has(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
      return;
    }
    if (atMax) return;
    onChange([...value, optionValue]);
  }

  function remove(optionValue: string) {
    onChange(value.filter((item) => item !== optionValue));
  }

  function selectAll() {
    const next: string[] = [...value];
    for (const option of options) {
      if (option.disabled || selectedSet.has(option.value)) continue;
      if (max !== undefined && next.length >= max) break;
      next.push(option.value);
    }
    onChange(next);
  }

  function clearAll() {
    onChange([]);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (
      event.key === "Backspace" &&
      !searchable &&
      value.length > 0 &&
      !disabled
    ) {
      event.preventDefault();
      onChange(value.slice(0, -1));
    }
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && search === "" && value.length > 0) {
      event.preventDefault();
      onChange(value.slice(0, -1));
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSearch("");
      queueMicrotask(() => triggerRef.current?.focus());
    }
  }

  function renderItems(items: readonly MultiSelectOption[]) {
    return items.map((option) => {
      const selected = selectedSet.has(option.value);
      const optionDisabled =
        Boolean(option.disabled) || (atMax && !selected);

      return (
        <CommandItem
          key={option.value}
          value={option.label}
          keywords={[option.label, option.value]}
          disabled={optionDisabled}
          data-checked={selected}
          aria-selected={selected}
          onSelect={() => {
            if (optionDisabled) return;
            toggle(option.value);
          }}
          className={cn(
            "rounded-none last:rounded-b-lg",
            selected && "bg-muted",
          )}
        >
          {option.label}
        </CommandItem>
      );
    });
  }

  const chipClassName =
    "h-6 min-h-6 normal-case tracking-normal gap-2 py-0 pl-2 pr-0.5";

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            {...control}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls={contentId}
            aria-describedby={[control["aria-describedby"], liveId]
              .filter(Boolean)
              .join(" ")}
            disabled={disabled}
            data-size="default"
            data-placeholder={value.length === 0 ? "" : undefined}
            onKeyDown={handleTriggerKeyDown}
            className={cn(selectTriggerClassName, "w-full")}
          >
            <span className="truncate">
              {value.length === 0
                ? placeholder
                : `${value.length} sélectionnée${value.length > 1 ? "s" : ""}`}
            </span>
            <ChevronDown
              aria-hidden="true"
              className="text-muted-foreground"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          id={contentId}
          align="start"
          sideOffset={8}
          className="w-(--radix-popover-trigger-width) min-w-64 overflow-hidden rounded-lg p-0"
          role="listbox"
          aria-multiselectable="true"
          aria-label={label}
        >
          <Command
            label={`Rechercher dans ${label}`}
            filter={filterOptions}
            className="rounded-lg! p-0"
            shouldFilter={searchable}
          >
            {searchable ? (
              <CommandInput
                placeholder="Rechercher…"
                value={search}
                onValueChange={setSearch}
                onKeyDown={handleSearchKeyDown}
              />
            ) : null}
            <div className="flex flex-wrap gap-2 border-b border-input px-3 py-1">
              <button
                type="button"
                disabled={disabled || atMax || options.every((o) => selectedSet.has(o.value) || o.disabled)}
                onClick={selectAll}
                className="min-h-11 rounded-md px-3 text-base text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:text-muted-foreground"
              >
                Tout sélectionner
              </button>
              <button
                type="button"
                disabled={disabled || value.length === 0}
                onClick={clearAll}
                className="min-h-11 rounded-md px-3 text-base text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:text-muted-foreground"
              >
                Tout effacer
              </button>
            </div>
            <CommandList>
              <CommandEmpty>
                {search
                  ? `Aucun résultat pour « ${search} »`
                  : "Aucune option disponible"}
              </CommandEmpty>
              {atMax ? (
                <p className="px-3 py-2 text-base text-muted-foreground">
                  Limite atteinte ({max}). Retirez une sélection pour en ajouter.
                </p>
              ) : null}
              {ungrouped.length > 0 ? (
                <CommandGroup className="p-0 pt-1">
                  {renderItems(ungrouped)}
                </CommandGroup>
              ) : null}
              {[...groups.entries()].map(([groupName, items]) => (
                <CommandGroup
                  key={groupName}
                  heading={groupName}
                  className="p-0 pt-1"
                >
                  {renderItems(items)}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedOptions.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Sélection actuelle">
          {visibleChips.map((option) => (
            <li key={option.value}>
              <Badge variant="secondary" className={chipClassName}>
                <span>{option.label}</span>
                <button
                  type="button"
                  aria-label={`Retirer ${option.label}`}
                  disabled={disabled}
                  onClick={() => remove(option.value)}
                  className="relative flex items-center justify-center rounded-sm pt-0.5 pr-0.5 pb-0.5 text-muted-foreground outline-none after:absolute after:-inset-2.5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
                >
                  <X aria-hidden="true" className="size-2.5" />
                </button>
              </Badge>
            </li>
          ))}
          {hiddenCount > 0 ? (
            <li>
              <Badge variant="outline" className={cn(chipClassName, "pr-2")}>
                + {hiddenCount} autres
              </Badge>
            </li>
          ) : null}
        </ul>
      ) : null}

      <p id={liveId} className="sr-only" aria-live="polite">
        {liveMessage}
      </p>
    </div>
  );
}
