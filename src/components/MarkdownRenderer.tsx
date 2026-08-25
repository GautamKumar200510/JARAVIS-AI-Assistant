import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';
import { useJaravis } from '../context/JaravisContext';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  forceRenderMode?: 'rich_markdown' | 'cyber_tactical' | 'raw_terminal';
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  forceRenderMode
}) => {
  const { textFormatSettings, fontClass, fontSizeClass, lineSpacingClass } = useJaravis();
  const activeMode = forceRenderMode || textFormatSettings.renderMode;

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // If Raw Terminal Mode is selected
  if (activeMode === 'raw_terminal') {
    return (
      <div
        id="raw-terminal-view"
        className={`font-jetbrains text-xs md:text-sm leading-relaxed p-4 bg-[#0a0a0c] border border-cyan-950/80 rounded-xl text-cyan-300 whitespace-pre-wrap selection:bg-cyan-500 selection:text-black overflow-x-auto ${className}`}
      >
        <div className="flex items-center space-x-2 text-[10px] text-gray-500 pb-2 mb-2 border-b border-[#1f1f23] select-none font-mono">
          <Terminal className="w-3 h-3 text-cyan-400" />
          <span>TERMINAL_STREAM_OUTPUT // RAW_FORMAT</span>
        </div>
        {content}
      </div>
    );
  }

  // If Cyber Tactical HUD Mode is selected
  if (activeMode === 'cyber_tactical') {
    return (
      <div
        id="cyber-tactical-view"
        className={`font-rajdhani ${fontSizeClass} ${lineSpacingClass} tracking-wide text-gray-100 ${className}`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <div className="mt-4 mb-2 pb-1 border-b border-cyan-500/40 flex items-center space-x-2 text-cyan-300 font-bold uppercase text-lg tracking-wider">
                <span className="text-cyan-500 font-mono text-xs">[SEC.01]</span>
                <span>{children}</span>
              </div>
            ),
            h2: ({ children }) => (
              <div className="mt-3 mb-2 flex items-center space-x-2 text-cyan-400 font-semibold uppercase text-base tracking-wider">
                <span className="text-cyan-600 font-mono text-xs">##</span>
                <span>{children}</span>
              </div>
            ),
            h3: ({ children }) => (
              <div className="mt-2 mb-1 text-cyan-400 font-medium uppercase text-sm tracking-wider">
                &gt; {children}
              </div>
            ),
            p: ({ children }) => (
              <p className="mb-2.5 text-gray-200">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="text-cyan-300 font-bold bg-cyan-950/30 px-1 py-0.5 rounded border border-cyan-500/20">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="text-cyan-200/90 italic font-mono text-[0.95em]">
                {children}
              </em>
            ),
            ul: ({ children }) => (
              <ul className="space-y-1.5 my-2 pl-2 border-l border-cyan-500/30">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="space-y-1.5 my-2 pl-2 border-l border-cyan-500/30">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="flex items-start space-x-2 text-gray-200">
                <span className="text-cyan-400 font-mono text-xs mt-1">▸</span>
                <span className="flex-1">{children}</span>
              </li>
            ),
            blockquote: ({ children }) => (
              <div className="border-l-2 border-cyan-400 bg-[#121216] px-3 py-2 my-2 rounded-r text-gray-300 text-sm font-mono">
                {children}
              </div>
            ),
            code: ({ inline, className: codeClass, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(codeClass || '');
              const codeString = String(children).replace(/\n$/, '');
              if (!inline && (match || codeString.includes('\n') || codeString.length > 40)) {
                return (
                  <div className="my-3 rounded-lg overflow-hidden border border-cyan-500/30 bg-[#09090c] font-jetbrains text-xs">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#141419] border-b border-[#25252b] text-[11px] text-cyan-400">
                      <div className="flex items-center space-x-2">
                        <Code2 className="w-3.5 h-3.5" />
                        <span className="uppercase tracking-wider font-mono">{match ? match[1] : 'TACTICAL_CODE'}</span>
                      </div>
                      <button
                        type="button"
                        id="copy-tactical-code-btn"
                        onClick={() => handleCopy(codeString, 99)}
                        className="hover:text-white flex items-center space-x-1 transition-colors"
                      >
                        {copiedIndex === 99 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex === 99 ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                    <pre className="p-3 overflow-x-auto text-cyan-300 selection:bg-cyan-700">
                      <code>{codeString}</code>
                    </pre>
                  </div>
                );
              }
              return (
                <code className="bg-cyan-950/50 text-cyan-300 font-jetbrains text-[0.85em] px-1.5 py-0.5 rounded border border-cyan-800/40">
                  {children}
                </code>
              );
            },
            table: ({ children }) => (
              <div className="overflow-x-auto my-3 border border-[#25252b] rounded-lg">
                <table className="min-w-full text-xs text-left">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="bg-[#14141a] px-3 py-2 font-mono uppercase text-cyan-400 border-b border-[#25252b]">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 border-b border-[#1c1c22] text-gray-300 font-mono text-[11px]">
                {children}
              </td>
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Default: Rich Markdown Mode with chosen Font & Scale
  return (
    <div
      id="rich-markdown-view"
      className={`${fontClass} ${fontSizeClass} ${lineSpacingClass} markdown-formatted text-gray-200 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg md:text-xl font-bold text-white mt-4 mb-2 pb-1 border-b border-[#2d2d35]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base md:text-lg font-semibold text-cyan-300 mt-3 mb-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm md:text-base font-semibold text-sky-400 mt-2.5 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="text-white font-semibold">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-gray-300 italic">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1 my-2.5 text-gray-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1 my-2.5 text-gray-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-cyan-500 bg-[#16161c] px-4 py-2 my-3 rounded-r-lg text-gray-300 italic">
              {children}
            </blockquote>
          ),
          code: ({ inline, className: codeClass, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(codeClass || '');
            const codeString = String(children).replace(/\n$/, '');
            const blockId = Math.floor(Math.random() * 100000);

            if (!inline && (match || codeString.includes('\n') || codeString.length > 50)) {
              return (
                <div className="my-3.5 rounded-xl overflow-hidden border border-[#27272a] bg-[#0c0c0e] shadow-lg">
                  <div className="flex items-center justify-between px-3.5 py-2 bg-[#17171c] border-b border-[#27272a] text-xs text-gray-400 font-mono">
                    <div className="flex items-center space-x-2">
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-semibold text-cyan-400 uppercase tracking-wider">
                        {match ? match[1] : 'code'}
                      </span>
                    </div>
                    <button
                      type="button"
                      id={`copy-code-block-${blockId}`}
                      onClick={() => handleCopy(codeString, blockId)}
                      className="hover:text-white flex items-center space-x-1.5 px-2 py-1 rounded bg-[#22222a] hover:bg-[#2c2c36] text-[11px] transition-colors"
                    >
                      {copiedIndex === blockId ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-xs md:text-[13px] font-jetbrains text-cyan-300 leading-relaxed">
                    <code>{codeString}</code>
                  </pre>
                </div>
              );
            }
            return (
              <code className="bg-[#18181b] text-cyan-300 font-jetbrains text-[0.875em] px-1.5 py-0.5 rounded border border-[#27272a]">
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-[#2d2d35]">
              <table className="min-w-full text-xs md:text-sm divide-y divide-[#2d2d35]">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-[#16161a] px-3.5 py-2.5 text-left font-mono uppercase text-cyan-400 text-xs font-semibold tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2 text-gray-300 border-t border-[#1f1f23]">
              {children}
            </td>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors font-medium"
            >
              {children}
            </a>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
