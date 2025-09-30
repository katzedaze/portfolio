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

// 一般的なスキルリスト
const COMMON_SKILLS = [
  // フロントエンド
  "React",
  "Vue.js",
  "Angular",
  "Next.js",
  "Nuxt.js",
  "TypeScript",
  "JavaScript",
  "HTML",
  "CSS",
  "Sass",
  "Tailwind CSS",
  "Material-UI",
  "Ant Design",
  "Chakra UI",
  "Redux",
  "Zustand",
  "Recoil",
  "React Query",
  "SWR",
  "Webpack",
  "Vite",
  "Remix",

  // バックエンド
  "Node.js",
  "Express",
  "Nest.js",
  "Python",
  "Django",
  "Flask",
  "FastAPI",
  "Ruby",
  "Ruby on Rails",
  "PHP",
  "Laravel",
  "Go",
  "Gin",
  "Echo",
  "Java",
  "Spring Boot",
  "Kotlin",
  "C#",
  ".NET",
  "Rust",
  "Actix",
  "Elixir",
  "Phoenix",

  // データベース
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "SQLite",
  "DynamoDB",
  "Firebase",
  "Supabase",
  "Prisma",
  "TypeORM",
  "Sequelize",
  "Drizzle ORM",

  // インフラ/DevOps
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "Vercel",
  "Netlify",
  "Heroku",
  "GitHub Actions",
  "GitLab CI",
  "Jenkins",
  "CircleCI",
  "Terraform",
  "Ansible",
  "Linux",
  "Nginx",
  "Apache",

  // その他
  "Git",
  "GitHub",
  "GitLab",
  "Bitbucket",
  "Jest",
  "Vitest",
  "Cypress",
  "Playwright",
  "Storybook",
  "Figma",
  "Adobe XD",
  "Photoshop",
  "Illustrator",
  "GraphQL",
  "REST API",
  "gRPC",
  "WebSocket",
  "Microservices",
  "Serverless",
].sort();

interface SkillComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SkillCombobox({
  value,
  onChange,
  disabled,
}: SkillComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  // valueが変更されたら inputValueも更新
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setInputValue(selectedValue);
    setOpen(false);
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);
  };

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
          {value || "スキルを選択または入力..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="スキル名を検索または入力..."
            value={inputValue}
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>
              <div className="p-2 text-sm text-center">
                <p className="text-muted-foreground">「{inputValue}」を入力</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    onChange(inputValue);
                    setOpen(false);
                  }}
                >
                  このまま使用
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup>
              {COMMON_SKILLS.filter((skill) =>
                skill.toLowerCase().includes(inputValue.toLowerCase())
              ).map((skill) => (
                <CommandItem
                  key={skill}
                  value={skill}
                  onSelect={() => handleSelect(skill)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === skill ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {skill}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
