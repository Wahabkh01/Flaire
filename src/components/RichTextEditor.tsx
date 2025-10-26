"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useEffect, useState } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ value, onChange }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-purple-400 underline cursor-pointer hover:text-purple-300 transition-colors",
        },
      }),
      Placeholder.configure({
        placeholder: "✨ Craft your compelling message here... Use {Name} for personalization",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);
  

  if (!mounted || !editor) return null;

  // Helper for adding/editing link
  const setLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL (leave empty to remove)", previousUrl || "");

    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  // Modern toolbar button component
  type Variant = "default" | "accent" | "danger";

interface ToolbarButtonProps {
  onClick?: () => void;
  isActive?: boolean;
  children?: React.ReactNode;
  tooltip?: string;
  variant?: Variant;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive = false,
  children,
  tooltip,
  variant = "default",
  disabled = false,
}) => {
  const baseClasses =
    "relative overflow-hidden px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

  const variants: Record<Variant, string> = {
    default: isActive
      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
      : "bg-white/10 backdrop-blur-sm text-white/90 border border-white/20 hover:bg-white/20 hover:border-white/30",
    accent: isActive
      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
      : "bg-white/10 backdrop-blur-sm text-white/90 border border-white/20 hover:bg-white/20 hover:border-white/30",
    danger: isActive
      ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
      : disabled
      ? "bg-white/5 text-white/30 border border-white/10"
      : "bg-white/10 backdrop-blur-sm text-white/90 border border-white/20 hover:bg-red-500/20 hover:border-red-400/30",
  };

  // ✅ Cast variant as keyof typeof variants to fix the TypeScript index error
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant as keyof typeof variants]}`}
      title={tooltip}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      <span className="relative z-10">{children}</span>
    </button>
  );
};


  return (
    <div className="relative overflow-hidden bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full translate-y-12 -translate-x-12"></div>

      {/* Toolbar */}
      <div className="relative z-10 flex flex-wrap items-center gap-2 p-4 border-b border-white/20 bg-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {/* Text formatting */}
          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              tooltip="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              tooltip="Italic (Ctrl+I)"
            >
              <em>I</em>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              tooltip="Underline (Ctrl+U)"
            >
              <u>U</u>
            </ToolbarButton>
          </div>

          {/* Link controls */}
          <div className="flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            <ToolbarButton
              onClick={setLink}
              isActive={editor.isActive("link")}
              variant="accent"
              tooltip={editor.isActive("link") ? "Edit link" : "Add link"}
            >
              🔗
            </ToolbarButton>
            <ToolbarButton
              onClick={setLink}
              disabled={!editor.isActive("link")}
              variant="danger"
              tooltip="Remove link"
            >
              ❌
            </ToolbarButton>
          </div>

          {/* Personalization */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/10">
            <ToolbarButton
              onClick={() => editor.chain().focus().insertContent(" {Name} ").run()}
              variant="accent"
              tooltip="Insert personalization variable"
            >
              <span className="flex items-center gap-1">
                <span>👤</span>
                <span className="text-xs">{"{Name}"}</span>
              </span>
            </ToolbarButton>
          </div>
        </div>

        {/* Format indicators */}
        <div className="ml-auto flex items-center gap-2 text-xs text-white/60">
          {editor.isActive("bold") && <span className="bg-purple-500/20 px-2 py-1 rounded text-purple-200">Bold</span>}
          {editor.isActive("italic") && <span className="bg-purple-500/20 px-2 py-1 rounded text-purple-200">Italic</span>}
          {editor.isActive("underline") && <span className="bg-purple-500/20 px-2 py-1 rounded text-purple-200">Underline</span>}
          {editor.isActive("link") && <span className="bg-blue-500/20 px-2 py-1 rounded text-blue-200">Link</span>}
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative z-10">
        <EditorContent 
          editor={editor} 
          className="prose prose-invert max-w-none p-6 min-h-[200px] text-white/90 focus-within:bg-white/5 transition-colors duration-300" 
        />
      </div>

      {/* Footer with helpful tips */}
      <div className="relative z-10 px-6 py-3 border-t border-white/20 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-white/60">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span>💡</span>
              <span>Use <code className="bg-white/10 px-1 py-0.5 rounded text-white/80">{'{Name}'}</code> for personalization</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Rich text formatting enabled</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Custom editor styles */
        .ProseMirror {
          outline: none;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: rgba(255, 255, 255, 0.4);
          pointer-events: none;
          height: 0;
          font-style: italic;
        }

        .ProseMirror strong {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
        }

        .ProseMirror em {
          color: rgba(255, 255, 255, 0.95);
        }

        .ProseMirror u {
          text-decoration: underline;
          text-decoration-color: rgba(147, 51, 234, 0.6);
        }

        .ProseMirror a {
          color: rgb(147, 51, 234);
          text-decoration: underline;
          text-decoration-color: rgba(147, 51, 234, 0.6);
          transition: all 0.2s ease;
        }

        .ProseMirror a:hover {
          color: rgb(168, 85, 247);
          text-decoration-color: rgb(168, 85, 247);
        }

        .ProseMirror p {
          margin: 0.75rem 0;
        }

        .ProseMirror p:first-child {
          margin-top: 0;
        }

        .ProseMirror p:last-child {
          margin-bottom: 0;
        }

        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }

        .ProseMirror li {
          margin: 0.25rem 0;
        }

        .ProseMirror blockquote {
          border-left: 4px solid rgba(147, 51, 234, 0.6);
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: rgba(255, 255, 255, 0.8);
        }

        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }

        .ProseMirror h1 {
          font-size: 1.5rem;
        }

        .ProseMirror h2 {
          font-size: 1.25rem;
        }

        .ProseMirror h3 {
          font-size: 1.125rem;
        }

        /* Selection styles */
        .ProseMirror ::selection {
          background: rgba(147, 51, 234, 0.3);
        }

        .ProseMirror ::-moz-selection {
          background: rgba(147, 51, 234, 0.3);
        }

        /* Custom scrollbar */
        .ProseMirror::-webkit-scrollbar {
          width: 6px;
        }

        .ProseMirror::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .ProseMirror::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 3px;
        }

        .ProseMirror::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
}