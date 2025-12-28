'use client'

import { useState } from 'react'
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  label?: string
  /** Make the code block collapsible */
  collapsible?: boolean
  /** Start collapsed */
  defaultCollapsed?: boolean
  className?: string
}

/**
 * Code block component with syntax highlighting appearance and copy button.
 * For this static site, we're using basic styling rather than a full syntax highlighter.
 */
export function CodeBlock({
  code,
  language = 'json',
  label,
  collapsible = false,
  defaultCollapsed = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('rounded-lg overflow-hidden', className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate border-b border-ink">
        <div className="flex items-center gap-3">
          {label && (
            <span className="text-small text-stone">{label}</span>
          )}
          <span className="text-caption font-mono text-stone/60">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          {collapsible && (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 text-stone hover:text-white transition-colors"
              aria-label={collapsed ? 'Expand code' : 'Collapse code'}
            >
              {collapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 text-stone hover:text-white transition-colors"
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-eucalypt" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      {!collapsed && (
        <pre className="bg-ink p-4 overflow-x-auto text-small">
          <code className="font-mono text-cloud">{code}</code>
        </pre>
      )}

      {collapsed && (
        <div className="bg-ink px-4 py-3 text-small text-stone">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="hover:text-white transition-colors"
          >
            Click to expand ({code.split('\n').length} lines)
          </button>
        </div>
      )}
    </div>
  )
}
