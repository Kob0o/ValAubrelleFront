"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "cn";

import {
  FieldWrapper,
  type FieldControlProps,
} from "@/components/forms/field-wrapper";
import { Badge } from "@/components/ui/badge";
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
  itemLabelSingular?: string;
  itemLabelPlural?: string;
  formatSelectionCount?: (count: number) => string;
};

const DEFAULT_PLACEHOLDER = "Choisir des options";
const DEFAULT_ITEM_SINGULAR = "élément";
const DEFAULT_ITEM_PLURAL = "éléments";
const MAX_VISIBLE_CHIPS = 3;

function defaultFormatSelectionCount(
  count: number,
  singular: string,
  plural: string,
): string {
  if (count === 0) return `Aucun ${singular} sélectionné`;
  if (count === 1) return `1 ${singular} sélectionné`;
  return `${count} ${plural} sélectionnés`;
}

function matchesSearch(option: MultiSelectOption, search: string): boolean {
  const needle = normalizeSearch(search);
  if (!needle) return true;
  return (
    normalizeSearch(option.label).includes(needle) ||
    normalizeSearch(option.value).includes(needle)
  );
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

function isOptionDisabled(
  option: MultiSelectOption,
  selected: boolean,
  atMax: boolean,
): boolean {
  return Boolean(option.disabled) || (atMax && !selected);
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
  itemLabelSingular = DEFAULT_ITEM_SINGULAR,
  itemLabelPlural = DEFAULT_ITEM_PLURAL,
  formatSelectionCount,
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
          itemLabelSingular={itemLabelSingular}
          itemLabelPlural={itemLabelPlural}
          formatSelectionCount={formatSelectionCount}
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
  itemLabelSingular: string;
  itemLabelPlural: string;
  formatSelectionCount?: (count: number) => string;
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
  itemLabelSingular,
  itemLabelPlural,
  formatSelectionCount,
}: MultiSelectControlProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelId = `${useId()}-panel`;
  const listId = `${useId()}-list`;
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

  const filteredOptions = useMemo(
    () => options.filter((option) => matchesSearch(option, search)),
    [options, search],
  );

  const { ungrouped, groups } = useMemo(
    () => groupOptions(filteredOptions),
    [filteredOptions],
  );

  const flatOptions = useMemo(() => {
    const list = [...ungrouped];
    for (const items of groups.values()) {
      list.push(...items);
    }
    return list;
  }, [ungrouped, groups]);

  const safeActiveIndex = Math.max(
    0,
    Math.min(activeIndex, flatOptions.length - 1),
  );
  const activeOption = flatOptions[safeActiveIndex];
  const activeOptionId = activeOption
    ? `${listId}-opt-${activeOption.value}`
    : undefined;

  const visibleChips = selectedOptions.slice(0, MAX_VISIBLE_CHIPS);
  const hiddenCount = Math.max(0, selectedOptions.length - MAX_VISIBLE_CHIPS);

  const liveMessage =
    formatSelectionCount?.(value.length) ??
    defaultFormatSelectionCount(
      value.length,
      itemLabelSingular,
      itemLabelPlural,
    );

  useEffect(() => {
    if (!open) return;
    if (searchable) {
      queueMicrotask(() => searchRef.current?.focus());
    } else {
      queueMicrotask(() => listRef.current?.focus());
    }
  }, [open, searchable]);

  useEffect(() => {
    if (!open || !activeOptionId) return;
    document
      .getElementById(activeOptionId)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeOptionId]);

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

  function moveActive(delta: number) {
    if (flatOptions.length === 0) return;
    setActiveIndex((current) => {
      const start = Math.max(0, Math.min(current, flatOptions.length - 1));
      let next = start;
      for (let step = 0; step < flatOptions.length; step += 1) {
        next = (next + delta + flatOptions.length) % flatOptions.length;
        const option = flatOptions[next];
        const selected = selectedSet.has(option.value);
        if (!isOptionDisabled(option, selected, atMax)) return next;
      }
      return start;
    });
  }

  function toggleActive() {
    const option = flatOptions[safeActiveIndex];
    if (!option) return;
    const selected = selectedSet.has(option.value);
    if (isOptionDisabled(option, selected, atMax)) return;
    toggle(option.value);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(0);
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

  function handleListKeyDown(event: KeyboardEvent<HTMLElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Enter":
        event.preventDefault();
        toggleActive();
        break;
      case " ":
        if (event.currentTarget instanceof HTMLInputElement && search !== "") {
          return;
        }
        event.preventDefault();
        toggleActive();
        break;
      case "Backspace":
        if (
          event.currentTarget instanceof HTMLInputElement &&
          search === "" &&
          value.length > 0
        ) {
          event.preventDefault();
          onChange(value.slice(0, -1));
        }
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      default:
        break;
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setActiveIndex(0);
    } else {
      setSearch("");
      setActiveIndex(0);
      queueMicrotask(() => triggerRef.current?.focus());
    }
  }

  function renderOption(option: MultiSelectOption, isLast: boolean) {
    const selected = selectedSet.has(option.value);
    const optionDisabled = isOptionDisabled(option, selected, atMax);
    const active = activeOption?.value === option.value;
    const optionDomId = `${listId}-opt-${option.value}`;

    return (
      <div
        key={option.value}
        id={optionDomId}
        role="option"
        aria-selected={selected}
        aria-disabled={optionDisabled || undefined}
        data-active={active || undefined}
        data-checked={selected || undefined}
        tabIndex={-1}
        onMouseEnter={() => {
          const index = flatOptions.findIndex(
            (item) => item.value === option.value,
          );
          if (index >= 0) setActiveIndex(index);
        }}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (optionDisabled) return;
          toggle(option.value);
        }}
        className={cn(
          "relative flex min-h-11 cursor-default items-center gap-2 px-3 py-2 text-base text-foreground outline-hidden select-none",
          isLast ? "rounded-b-lg" : "rounded-none",
          selected && "bg-muted font-semibold",
          active &&
            "bg-accent outline-2 -outline-offset-2 outline-solid outline-primary",
          optionDisabled && "pointer-events-none text-muted-foreground",
        )}
      >
        <span className="flex-1 truncate">{option.label}</span>
        <Check
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0",
            selected ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    );
  }

  const chipClassName =
    "h-6 min-h-6 overflow-visible normal-case tracking-normal gap-2 py-0 pl-2 pr-0.5";

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
            aria-controls={panelId}
            aria-haspopup="dialog"
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
              {value.length === 0 ? placeholder : liveMessage}
            </span>
            <ChevronDown
              aria-hidden="true"
              className="text-muted-foreground"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          id={panelId}
          align="start"
          sideOffset={8}
          className="w-(--radix-popover-trigger-width) min-w-64 overflow-hidden rounded-lg p-0"
          aria-label={label}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          {searchable ? (
            <div className="flex items-center gap-2 rounded-t-[inherit] border-b border-input px-3 has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-inset">
              <Search
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleListKeyDown}
                aria-label={`Rechercher dans ${label}`}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={activeOptionId}
                placeholder="Rechercher…"
                className="h-11 w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:text-muted-foreground"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 border-b border-input px-3 py-1">
            <button
              type="button"
              disabled={
                disabled ||
                atMax ||
                options.every(
                  (option) =>
                    selectedSet.has(option.value) || option.disabled,
                )
              }
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

          <div
            ref={listRef}
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={label}
            aria-activedescendant={activeOptionId}
            tabIndex={searchable ? -1 : 0}
            onKeyDown={handleListKeyDown}
            className="no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none"
          >
            {flatOptions.length === 0 ? (
              <p className="px-3 py-6 text-center text-base text-muted-foreground">
                {search
                  ? `Aucun résultat pour « ${search} »`
                  : "Aucune option disponible"}
              </p>
            ) : null}

            {atMax ? (
              <p className="px-3 py-2 text-base text-muted-foreground">
                Limite atteinte ({max}). Retirez une sélection pour en
                ajouter.
              </p>
            ) : null}

            {ungrouped.length > 0 ? (
              <div className="pt-1">
                {ungrouped.map((option, index) =>
                  renderOption(
                    option,
                    index === ungrouped.length - 1 && groups.size === 0,
                  ),
                )}
              </div>
            ) : null}

            {[...groups.entries()].map(([groupName, items], groupIndex) => (
              <div key={groupName} role="group" aria-label={groupName}>
                <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  {groupName}
                </p>
                {items.map((option, index) =>
                  renderOption(
                    option,
                    groupIndex === groups.size - 1 &&
                      index === items.length - 1,
                  ),
                )}
              </div>
            ))}
          </div>
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
                  className="relative -my-2.5 -mr-2.5 flex size-11 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
                >
                  <X aria-hidden="true" className="size-2.5" />
                </button>
              </Badge>
            </li>
          ))}
          {hiddenCount > 0 ? (
            <li>
              <Badge variant="outline" className={cn(chipClassName, "pr-2")}>
                {hiddenCount === 1
                  ? "+ 1 autre"
                  : `+ ${hiddenCount} autres`}
              </Badge>
            </li>
          ) : null}
        </ul>
      ) : null}

      <p id={liveId} className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </p>
    </div>
  );
}
