"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { ChevronDown } from "lucide-react";
import { cn } from "cn";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FieldWrapper,
  fieldControlClassName,
  type FieldControlProps,
} from "@/components/forms/field-wrapper";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectFieldProps = {
  label: string;
  options: readonly SelectOption[];
  /** Valeur choisie ; chaîne vide ou `undefined` = aucune sélection. */
  value: string | undefined;
  onChange: (value: string) => void;
  /** Invite courte tant que rien n'est choisi (« Choisir un rôle »), pas une consigne. */
  placeholder?: string;
  /** Liste filtrable par saisie (Command + Popover), pour les longues listes. */
  searchable?: boolean;
  error?: string;
  /** Consigne qui doit rester lisible après le choix : toujours ici, pas dans `placeholder`. */
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  /** Message affiché quand `options` est vide. */
  emptyMessage?: string;
  className?: string;
};

const DEFAULT_PLACEHOLDER = "Choisir une option";
const DEFAULT_EMPTY_MESSAGE = "Aucune option disponible";

const triggerClassName = cn(
  fieldControlClassName,
  "flex items-center justify-between gap-2 text-left whitespace-nowrap data-[size=default]:h-11",
  "data-placeholder:text-[var(--color-text-muted)]",
  "[&_svg]:size-5 [&_svg]:text-[var(--color-text-muted)]",
);

/** L'option active a un contour visible : le fond Brume seul est trop pâle (3:1). */
/**
 * Les options occupent toute la largeur de la liste, sans marge. Les options
 * en bord de liste reprennent son arrondi (ajouté par variante : avec la
 * recherche, la première option est sous le champ et reste carrée).
 */
const listClassName = "rounded-lg p-0";

const optionClassName = cn(
  "min-h-11 gap-2 py-2.5 pr-10 pl-3 text-base text-[var(--color-text)]",
  "rounded-none",
  // Coche de l'option choisie (Select Radix) alignée sur la marge intérieure.
  "[&>span:first-child]:right-3",
  // `outline-solid` est nécessaire : la primitive shadcn pose `outline-hidden`
  // (style `none`), qui rendrait le contour invisible malgré son épaisseur.
  "focus:outline-2 focus:-outline-offset-2 focus:outline-solid focus:outline-[var(--color-primary)]",
  "data-[selected=true]:outline-2 data-[selected=true]:-outline-offset-2 data-[selected=true]:outline-solid data-[selected=true]:outline-[var(--color-primary)]",
  "data-[state=checked]:font-semibold data-[checked=true]:font-semibold",
  "data-disabled:text-[var(--color-text-muted)] data-disabled:opacity-100",
);

export function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = DEFAULT_PLACEHOLDER,
  searchable = false,
  error,
  hint,
  required = false,
  disabled = false,
  name,
  id,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  className,
}: SelectFieldProps) {
  return (
    <FieldWrapper
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {(control) =>
        searchable ? (
          <SearchableSelect
            control={control}
            name={name}
            required={required}
            label={label}
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            emptyMessage={emptyMessage}
          />
        ) : (
          <Select
            name={name}
            value={value ?? ""}
            onValueChange={onChange}
            disabled={disabled}
            required={required}
          >
            <SelectTrigger {...control} className={triggerClassName}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent
              position="popper"
              sideOffset={4}
              className={cn("w-(--radix-select-trigger-width)", listClassName)}
            >
              {options.length === 0 ? (
                <p className="px-3 py-2 text-base text-[var(--color-text-muted)]">
                  {emptyMessage}
                </p>
              ) : (
                options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className={cn(
                      optionClassName,
                      "first:rounded-t-lg last:rounded-b-lg",
                    )}
                  >
                    {option.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )
      }
    </FieldWrapper>
  );
}

type SearchableSelectProps = {
  control: FieldControlProps;
  name?: string;
  required: boolean;
  label: string;
  options: readonly SelectOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder: string;
  disabled: boolean;
  emptyMessage: string;
};

function SearchableSelect({
  control,
  name,
  required,
  label,
  options,
  value,
  onChange,
  placeholder,
  disabled,
  emptyMessage,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentId = `${useId()}-options`;
  const selected = options.find((option) => option.value === value);

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            {...control}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls={contentId}
            disabled={disabled}
            data-placeholder={selected ? undefined : ""}
            onKeyDown={handleTriggerKeyDown}
            className={triggerClassName}
          >
            <span className="truncate">{selected?.label ?? placeholder}</span>
            <ChevronDown aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          id={contentId}
          align="start"
          sideOffset={8}
          className="w-(--radix-popover-trigger-width) min-w-64 overflow-hidden rounded-lg p-0"
        >
          {/* cmdk nomme le champ de recherche avec `label` (aria-labelledby). */}
          <Command
            label={`Rechercher dans ${label}`}
            className="rounded-lg! p-0"
          >
            <CommandPrimitive.Input
              placeholder="Rechercher…"
              className={cn(
                fieldControlClassName,
                // Collé en haut de la liste : même arrondi qu'elle, bordure basse
                // seulement, et focus en anneau intérieur (pas l'outline bleu du
                // navigateur, rogné aux coins par la liste).
                "rounded-none rounded-t-lg border-x-0 border-t-0 outline-none",
                "focus-visible:ring-inset",
              )}
            />
            <CommandList>
              <CommandEmpty className="px-3 py-4 text-base text-[var(--color-text-muted)]">
                {options.length === 0 ? emptyMessage : "Aucun résultat"}
              </CommandEmpty>
              {/* Espace sous la recherche : le contour de la 1re option active
                ne se colle pas à celui du champ (toujours focus, cmdk). */}
              <CommandGroup className="p-0 pt-1">
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label]}
                    disabled={option.disabled}
                    data-checked={option.value === value}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(optionClassName, "last:rounded-b-lg")}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {/*
        Valeur transmise aux formulaires HTML (`name`) et validation native
        (`required`), comme le <select> caché que Radix ajoute à l'autre variante.
        Invisible et hors tabulation ; si le navigateur le signale comme
        invalide, le focus est renvoyé sur le déclencheur.
      */}
      {name || required ? (
        <input
          aria-hidden="true"
          tabIndex={-1}
          name={name}
          value={value ?? ""}
          required={required}
          disabled={disabled}
          onChange={() => {}}
          onFocus={() => triggerRef.current?.focus()}
          className="pointer-events-none absolute bottom-0 left-0 size-px opacity-0"
        />
      ) : null}
    </div>
  );
}
