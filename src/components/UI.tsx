import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
export function Modal({
  children,
  close,
  title,
}: {
  children: ReactNode;
  close: () => void;
  title: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current
      ?.querySelector<HTMLElement>("input,select,textarea,button")
      ?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),input,select,textarea,[tabindex="0"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-bg">
      <div
        className="modal"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          type="button"
          className="modal-x"
          aria-label="Close dialog"
          onClick={close}
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
type Feedback = {
  notify: (text: string, error?: boolean) => void;
  confirm: (title: string, body: string) => Promise<boolean>;
};
const Context = createContext<Feedback>({
  notify: () => {},
  confirm: async () => false,
});
export const useFeedback = () => useContext(Context);
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const [ask, setAsk] = useState<{
    title: string;
    body: string;
    resolve: (yes: boolean) => void;
  } | null>(null);
  const answer = (yes: boolean) => {
    ask?.resolve(yes);
    setAsk(null);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <Context.Provider
      value={{
        notify: (text, error = false) => {
          setToast({ text, error });
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setToast(null), 4500);
        },
        confirm: (title, body) =>
          new Promise((resolve) => setAsk({ title, body, resolve })),
      }}
    >
      {children}
      {toast && (
        <div
          className={"toast " + (toast.error ? "error" : "")}
          role={toast.error ? "alert" : "status"}
        >
          {toast.error ? <AlertCircle2Fallback /> : <CheckCircle2 size={19} />}
          <span>{toast.text}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {ask && (
        <Modal title={ask.title} close={() => answer(false)}>
          <h2>{ask.title}</h2>
          <p>{ask.body}</p>
          <div className="dialog-actions">
            <button className="secondary" onClick={() => answer(false)}>
              Cancel
            </button>
            <button className="danger" onClick={() => answer(true)}>
              Confirm
            </button>
          </div>
        </Modal>
      )}
    </Context.Provider>
  );
}
function AlertCircle2Fallback() {
  return <AlertCircle size={19} />;
}
