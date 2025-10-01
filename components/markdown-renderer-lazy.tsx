"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const MarkdownRenderer = dynamic(
  () =>
    import("./markdown-renderer").then((mod) => ({
      default: mod.MarkdownRenderer,
    })),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-800 h-20 rounded" />
    ),
    ssr: false,
  }
);

interface MarkdownRendererLazyProps {
  content: string;
  className?: string;
}

export function MarkdownRendererLazy({
  content,
  className,
}: MarkdownRendererLazyProps) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse bg-gray-200 dark:bg-gray-800 h-20 rounded" />
      }
    >
      <MarkdownRenderer content={content} className={className} />
    </Suspense>
  );
}
