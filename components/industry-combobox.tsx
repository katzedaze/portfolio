"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

const COMMON_INDUSTRIES = [
  "IT・ソフトウェア",
  "Web・インターネット",
  "SIer",
  "コンサルティング",
  "金融・保険",
  "製造業",
  "通信・ネットワーク",
  "メディア・広告",
  "EC・通販",
  "医療・ヘルスケア",
  "教育・人材",
  "小売・流通",
  "不動産",
  "ゲーム",
  "エンターテイメント",
  "官公庁・自治体",
].sort();

interface IndustryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function IndustryCombobox({
  value,
  onChange,
  disabled,
}: IndustryComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const handleSelect = (currentValue: string) => {
    onChange(currentValue);
    setOpen(false);
    setSearchValue("");
  };

  const displayValue = value || "業界を選択";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {displayValue}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="業界を検索または入力..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              <button
                onClick={() => handleSelect(searchValue)}
                className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
              >
                &quot;{searchValue}&quot; を追加
              </button>
            </CommandEmpty>
            <CommandGroup>
              {COMMON_INDUSTRIES.map((industry) => (
                <CommandItem
                  key={industry}
                  value={industry}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === industry ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {industry}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
