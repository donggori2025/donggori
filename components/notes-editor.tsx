"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import {
  Bold,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function NotesEditor({
  value,
  onChange,
  compact,
  placeholder = "공장·샘플 작업 시 확인할 내용을 자유롭게 작성하세요. 목록, 이미지, 강조 표시를 사용할 수 있습니다.",
}: {
  value: string;
  onChange: (html: string) => void;
  compact?: boolean;
  placeholder?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        link: false,
      }),
      Placeholder.configure({
        placeholder: compact ? "작업 시 확인할 내용을 작성하세요." : placeholder,
      }),
      Image.configure({ allowBase64: true }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: compact
          ? "min-h-full px-2 py-1.5 text-[10px] leading-snug text-ink outline-none print:text-[12px]"
          : "min-h-[280px] px-4 py-3 text-[14px] leading-relaxed text-ink outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    const incoming = value || "";
    if (editor.getHTML() === incoming) return;
    editor.commands.setContent(incoming, { emitUpdate: false });
  }, [editor, value]);

  const ui = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed) return null;
      return {
        bold: ed.isActive("bold"),
        italic: ed.isActive("italic"),
        underline: ed.isActive("underline"),
        strike: ed.isActive("strike"),
        bullet: ed.isActive("bulletList"),
        ordered: ed.isActive("orderedList"),
        canUndo: ed.can().undo(),
        canRedo: ed.can().redo(),
      };
    },
  });

  function insertImage(files: FileList | null) {
    const file = files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        editor.chain().focus().setImage({ src: reader.result }).run();
      }
    };
    reader.readAsDataURL(file);
  }

  const icon = compact ? 11 : 14;

  return (
    <div
      className={cn(
        "notes-editor overflow-hidden",
        compact ? "flex h-full min-h-0 flex-col" : "rounded-2xl border border-mist",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-0.5 border-b text-stone print:hidden",
          compact ? "border-[#e6e4de] bg-white px-1 py-0.5" : "border-mist bg-paper px-2 py-1.5",
        )}
      >
        <ToolBtn compact={compact} label="굵게" active={ui?.bold} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold size={icon} />
        </ToolBtn>
        <ToolBtn compact={compact} label="기울임" active={ui?.italic} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic size={icon} />
        </ToolBtn>
        <ToolBtn compact={compact} label="밑줄" active={ui?.underline} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          <Underline size={icon} />
        </ToolBtn>
        <ToolBtn compact={compact} label="취소선" active={ui?.strike} onClick={() => editor?.chain().focus().toggleStrike().run()}>
          <Strikethrough size={icon} />
        </ToolBtn>
        <span className={cn(compact ? "mx-0.5 h-3 w-px bg-[#e6e4de]" : "mx-1 h-4 w-px bg-mist")} />
        <ToolBtn compact={compact} label="글머리 기호" active={ui?.bullet} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <List size={icon} />
        </ToolBtn>
        <ToolBtn compact={compact} label="번호 목록" active={ui?.ordered} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={icon} />
        </ToolBtn>
        <ToolBtn compact={compact} label="이미지" onClick={() => fileRef.current?.click()}>
          <ImagePlus size={icon} />
        </ToolBtn>
        <span className={cn(compact ? "mx-0.5 h-3 w-px bg-[#e6e4de]" : "mx-1 h-4 w-px bg-mist")} />
        <ToolBtn compact={compact} label="실행 취소" disabled={!ui?.canUndo} onClick={() => editor?.chain().focus().undo().run()}>
          <Undo2 size={icon} />
        </ToolBtn>
        <ToolBtn compact={compact} label="다시 실행" disabled={!ui?.canRedo} onClick={() => editor?.chain().focus().redo().run()}>
          <Redo2 size={icon} />
        </ToolBtn>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            insertImage(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      <div className={cn(compact ? "min-h-0 flex-1 overflow-auto bg-white" : "bg-snow")}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolBtn({
  children,
  label,
  active,
  disabled,
  compact,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-md",
        compact ? "h-5 w-5" : "h-7 w-7",
        disabled ? "opacity-30" : compact ? "hover:bg-[#f3f2ef]" : "hover:bg-snow",
        active && (compact ? "bg-[#f3f2ef] text-ink" : "bg-snow text-ink"),
      )}
    >
      {children}
    </button>
  );
}
