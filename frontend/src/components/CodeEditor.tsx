import { EditorState, Extension } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { useEffect, useRef } from 'react'
import './CodeEditor.css'

interface Props {
  value: string
  onChange: (value: string) => void
  onExecute: () => void
  onReset: () => void
  isExecuting: boolean
}

// Custom Kumir syntax highlighting
const kumirHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: '#ff79c6' },
  { tag: tags.comment, color: '#6272a4' },
  { tag: tags.number, color: '#bd93f9' },
])

export default function CodeEditor({ value, onChange, onExecute, onReset, isExecuting }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    const startState = EditorState.create({
      doc: value,
      extensions: [
        keymap.of(defaultKeymap),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
        syntaxHighlighting(kumirHighlight),
        EditorView.theme({
          '&': {
            background: '#1e1e1e',
            color: '#d4d4d4',
            fontSize: '14px',
          },
          '.cm-content': {
            padding: '10px',
            fontFamily: 'monospace',
          },
          '.cm-gutters': {
            background: '#1e1e1e',
            color: '#858585',
            border: 'none',
          },
        }),
      ],
    })

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [])

  // Update value from outside
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      })
    }
  }, [value])

  return (
    <div className="code-editor-container">
      <div className="editor-toolbar">
        <button onClick={onExecute} disabled={isExecuting} className="run-btn">
          {isExecuting ? '⏳ Выполнение...' : '▶ Запустить'}
        </button>
        <button onClick={onReset} className="reset-btn">
          🔄 Сброс
        </button>
        <div className="editor-hint">
          Команды: вперед, налево, направо, нц N раз ... кц
        </div>
      </div>
      <div ref={editorRef} className="code-editor" />
    </div>
  )
}
