import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div
      className={`prose prose-gray dark:prose-invert max-w-none ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          h1: ({ node: _node, ...props }) => (
            <h1 className="text-3xl font-bold mb-4" {...props} />
          ),
          h2: ({ node: _node, ...props }) => (
            <h2 className="text-2xl font-bold mb-3 mt-6" {...props} />
          ),
          h3: ({ node: _node, ...props }) => (
            <h3 className="text-xl font-bold mb-2 mt-4" {...props} />
          ),
          p: ({ node: _node, ...props }) => (
            <p className="mb-4 leading-relaxed" {...props} />
          ),
          ul: ({ node: _node, ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
          ),
          ol: ({ node: _node, ...props }) => (
            <ol
              className="list-decimal list-inside mb-4 space-y-2"
              {...props}
            />
          ),
          li: ({ node: _node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          a: ({ node: _node, ...props }) => (
            <a
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          code: ({ node: _node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;

            if (isInline) {
              return (
                <code
                  className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
