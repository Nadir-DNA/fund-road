
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const content = "";

/**
 * Secure markdown component that uses react-markdown for safe rendering
 * This prevents XSS attacks by properly sanitizing markdown content
 */
export default function MarkdownContent({ content }: { content: string }) {
  if (!content) return null;
  
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        className="prose prose-invert max-w-none markdown-styles"
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-5 mb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mt-4 mb-1">{children}</h3>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4">{children}</ol>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="mb-1">{children}</li>
          ),
          p: ({ children }) => (
            <p className="mb-4">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
