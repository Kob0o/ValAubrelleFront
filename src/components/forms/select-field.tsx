"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "cn";

import {
  FieldWrapper,
  type FieldControlProps,
} from "@/components/forms/field-wrapper";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  selectTriggerClassName,
} from "@/components/ui/select";

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
  /** Consigne du champ, dans l'infobulle de l'icône d'information : toujours ici, pas dans `placeholder`. */
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
      {(control, layout) =>
        searchable ? (
          <SearchableSelect
            control={control}
            triggerClassName={layout.trailingPaddingClassName}
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
            <SelectTrigger
              {...control}
              className={cn("w-full", layout.trailingPaddingClassName)}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent
              position="popper"
              sideOffset={4}
              className="w-(--radix-select-trigger-width)"
            >
              {options.length === 0 ? (
                <p className="px-3 py-2 text-base text-muted-foreground">
                  {emptyMessage}
                </p>
              ) : (
                options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
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
  triggerClassName?: string;
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

/**
 * Variante filtrable : déclencheur au style de `SelectTrigger`, liste
 * Command (cmdk) dans un Popover. Réutilisable par le futur MultiSelect.
 */
function SearchableSelect({
  control,
  triggerClassName,
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
            data-size="default"
            data-placeholder={selected ? undefined : ""}
            onKeyDown={handleTriggerKeyDown}
            className={cn(selectTriggerClassName, "w-full", triggerClassName)}
          >
            <span className="truncate">{selected?.label ?? placeholder}</span>
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
        >
          {/* cmdk nomme le champ de recherche avec `label` (aria-labelledby). */}
          <Command label={`Rechercher dans ${label}`} className="rounded-lg! p-0">
            <CommandInput placeholder="Rechercher…" />
            <CommandList>
              <CommandEmpty>
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
                    // Collée aux bords ; seule la dernière reprend l'arrondi,
                    // la première est sous le champ de recherche.
                    className="rounded-none last:rounded-b-lg"
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
