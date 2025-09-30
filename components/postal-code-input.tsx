"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface PostalCodeInputProps {
  postalCode: string;
  address: string;
  onPostalCodeChange: (value: string) => void;
  onAddressChange: (value: string) => void;
}

export function PostalCodeInput({
  postalCode,
  address,
  onPostalCodeChange,
  onAddressChange,
}: PostalCodeInputProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 郵便番号が7桁の数字になったら住所を自動検索
    if (postalCode && /^\d{7}$/.test(postalCode.replace(/-/g, ""))) {
      fetchAddress(postalCode.replace(/-/g, ""));
    }
  }, [postalCode]);

  const fetchAddress = async (code: string) => {
    setIsLoading(true);
    try {
      // yubinbango-core2を使用して郵便番号から住所を取得
      const YubinBango = (await import("yubinbango-core2")).default;

      new YubinBango.Core(
        code,
        (result: { region?: string; locality?: string; street?: string }) => {
          if (result.region || result.locality || result.street) {
            const fullAddress = `${result.region || ""}${
              result.locality || ""
            }${result.street || ""}`;
            onAddressChange(fullAddress);
          }
        }
      );
    } catch (error) {
      console.error("Failed to fetch address:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPostalCode = (value: string) => {
    // 数字のみを抽出
    const numbers = value.replace(/\D/g, "");

    // 7桁以上の場合は7桁まで
    const truncated = numbers.slice(0, 7);

    // 3桁-4桁の形式にフォーマット
    if (truncated.length > 3) {
      return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
    }
    return truncated;
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPostalCode(e.target.value);
    onPostalCodeChange(formatted);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="postalCode">郵便番号</Label>
        <div className="relative">
          <Input
            id="postalCode"
            value={postalCode}
            onChange={handlePostalCodeChange}
            placeholder="123-4567"
            maxLength={8}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          郵便番号を入力すると自動で住所が入力されます
        </p>
      </div>

      <div>
        <Label htmlFor="address">住所</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="都道府県市区町村以降の住所"
        />
      </div>
    </div>
  );
}
