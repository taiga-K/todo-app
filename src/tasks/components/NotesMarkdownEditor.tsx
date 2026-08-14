import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Markdown } from "@tiptap/markdown";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { updateTask } from "wasp/client/operations";
import { cn } from "../../lib/utils";
import { normalizeNotes } from "../notes";
import "./NotesMarkdownEditor.css";

export interface NotesMarkdownEditorHandle {
  flush: () => Promise<void>;
}

interface NotesMarkdownEditorProps {
  taskId: string;
  /** Initial Markdown for this task; editor owns content after mount. */
  initialValue: string;
  className?: string;
}

/**
 * Google Docs–style Markdown autodetection:
 * typing `# `, `**bold**`, `*italic*`, `- `, `1. `, `[text](url)`, etc.
 * converts markers into rich text in place (no separate preview pane).
 * Persist via flush() / blur — TipTap is the source of truth while open.
 */
export const NotesMarkdownEditor = forwardRef<
  NotesMarkdownEditorHandle,
  NotesMarkdownEditorProps
>(function NotesMarkdownEditor(
  { taskId, initialValue, className },
  ref,
) {
  const serverNotesRef = useRef(initialValue);
  const saveChainRef = useRef(Promise.resolve());
  const generationRef = useRef(0);
  const taskIdRef = useRef(taskId);
  const editorRef = useRef<Editor | null>(null);

  taskIdRef.current = taskId;
  serverNotesRef.current = initialValue;

  const flushNotes = async (): Promise<void> => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    const next = normalizeNotes(editor.getMarkdown());
    const currentServer = normalizeNotes(serverNotesRef.current);
    const id = taskIdRef.current;

    if (next === currentServer) {
      return;
    }

    const generation = ++generationRef.current;
    saveChainRef.current = saveChainRef.current.then(async () => {
      if (generation !== generationRef.current) {
        return;
      }
      try {
        await updateTask({ id, notes: next });
        if (generation === generationRef.current && id === taskIdRef.current) {
          serverNotesRef.current = next;
        }
      } catch (err: unknown) {
        if (generation !== generationRef.current) {
          return;
        }
        editor.commands.setContent(serverNotesRef.current, {
          contentType: "markdown",
        });
        window.alert(`詳細の更新中にエラーが発生しました: ${String(err)}`);
      }
    });
    await saveChainRef.current;
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Markdown,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Placeholder.configure({
        placeholder: "詳細・手順・目的を書く…（Markdown を自動検出）",
      }),
    ],
    content: initialValue,
    contentType: "markdown",
    editorProps: {
      attributes: {
        class: "outline-none",
        "aria-label": "タスクの詳細説明",
      },
    },
    onBlur: () => {
      void flushNotes();
    },
  });

  editorRef.current = editor;

  useImperativeHandle(ref, () => ({ flush: flushNotes }), []);

  useEffect(() => {
    generationRef.current += 1;
    saveChainRef.current = Promise.resolve();
  }, [taskId]);

  return (
    <div className={cn("notes-editor min-h-[8rem]", className)}>
      <EditorContent editor={editor} />
    </div>
  );
});
