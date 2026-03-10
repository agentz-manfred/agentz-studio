import { useEditor, EditorContent } from "@tiptap/react";
import DOMPurify from "dompurify";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Code,
  Quote,
  Undo,
  Redo,
  Minus,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useEffect } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  minimal?: boolean;
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: '4px',
        background: active ? 'var(--color-green)' : 'transparent',
        color: active ? '#0A0A0A' : 'var(--color-text-tertiary)',
        border: active ? '1px solid var(--color-green-dark)' : '1px solid transparent',
        cursor: 'pointer',
        transition: 'all 100ms var(--ease-brutal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'var(--color-green)';
          e.currentTarget.style.borderColor = 'var(--color-border-strong)';
          e.currentTarget.style.background = 'var(--color-green-subtle)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = 'var(--color-text-tertiary)';
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Schreibe etwas…",
  className,
  editable = true,
  minimal = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  // Sync editable
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(className)}
      style={{
        border: editable ? '2px solid var(--color-border-strong)' : 'none',
        background: editable ? 'var(--color-surface-1)' : 'transparent',
        overflow: 'hidden',
      }}
    >
      {editable && !minimal && (
        <div
          className="flex items-center gap-0.5"
          style={{
            padding: '6px 8px',
            borderBottom: '2px solid var(--color-border-strong)',
            background: 'var(--color-surface-0)',
          }}
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Überschrift 2"
          >
            <Heading2 style={{ width: '14px', height: '14px' }} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="Überschrift 3"
          >
            <Heading3 style={{ width: '14px', height: '14px' }} strokeWidth={2} />
          </ToolbarButton>
          {/* Divider */}
          <div style={{ width: '2px', height: '16px', background: 'var(--color-border-strong)', margin: '0 4px' }} />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Fett"
          >
            <Bold style={{ width: '14px', height: '14px' }} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Kursiv"
          >
            <Italic style={{ width: '14px', height: '14px' }} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Code"
          >
            <Code style={{ width: '14px', height: '14px' }} strokeWidth={2} />
          </ToolbarButton>
          {/* Divider */}
          <div style={{ width: '2px', height: '16px', background: 'var(--color-border-strong)', margin: '0 4px' }} />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Liste"
          >
            <List style={{ width: '14px', height: '14px' }} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Nummerierte Liste"
          >
            <ListOrdered style={{ width: '14px', height: '14px' }} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Zitat"
          >
            <Quote style={{ width: '14px', height: '14px' }} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Trennlinie"
          >
            <Minus style={{ width: '14px', height: '14px' }} strokeWidth={2} />
          </ToolbarButton>
          <div style={{ flex: 1 }} />
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Rückgängig"
          >
            <Undo style={{ width: '14px', height: '14px' }} strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Wiederholen"
          >
            <Redo style={{ width: '14px', height: '14px' }} strokeWidth={2} />
          </ToolbarButton>
        </div>
      )}
      <EditorContent
        editor={editor}
        className={cn(
          "tiptap-editor",
          editable && "min-h-[120px]",
          !editable && "min-h-0"
        )}
      />
    </div>
  );
}

/** Read-only renderer for HTML content */
export function RichTextDisplay({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  if (!content || content === "<p></p>") return null;

  const clean = DOMPurify.sanitize(content);

  return (
    <div
      className={cn("tiptap-display", className)}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
