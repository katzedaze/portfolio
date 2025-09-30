'use client';

import * as React from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkillCombobox } from '@/components/skill-combobox';
import { Label } from '@/components/ui/label';

interface TechnologyMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function TechnologyMultiSelect({ value, onChange, disabled }: TechnologyMultiSelectProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAdd = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
      setIsAdding(false);
    }
  };

  const handleRemove = (tech: string) => {
    onChange(value.filter((t) => t !== tech));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <Label>使用技術</Label>

      {/* 選択済み技術の表示 */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-md border bg-muted/50 min-h-[60px]">
          {value.map((tech, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="px-3 py-1.5 text-sm flex items-center gap-1.5"
            >
              {tech}
              <button
                type="button"
                onClick={() => handleRemove(tech)}
                disabled={disabled}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* 技術追加UI */}
      {isAdding ? (
        <div className="space-y-2 p-3 border rounded-md bg-card">
          <SkillCombobox
            value={inputValue}
            onChange={setInputValue}
            disabled={disabled}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              disabled={!inputValue.trim() || disabled}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setInputValue('');
              }}
              disabled={disabled}
            >
              キャンセル
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAdding(true)}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          技術を追加
        </Button>
      )}

      <p className="text-xs text-muted-foreground">
        リストから選択するか、カスタムの技術名を入力できます
      </p>
    </div>
  );
}
