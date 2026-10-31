import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Loader2, MessageSquarePlus, Send, Sparkles, Trash2, UserRound } from 'lucide-react';
import { AiConsentModal } from '@/components/AiConsentModal';
import { RichText } from '@/components/RichText';
import { Button } from '@/components/ui/Button';
import { Alert, SimulationBadge, Spinner } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import { useAsync, useDocumentTitle } from '@/hooks/useAsync';
import { api, ApiError } from '@/services/api';
import type { ChatMessage, Conversation } from '@/types';
import { cn, formatDate } from '@/utils/format';

const SUGGESTIONS = [
  'Berdasarkan hasil refleksiku, peran apa yang cocok untuk dieksplorasi?',
  'Bagaimana cara memulai karier di bidang HR tanpa pengalaman?',
  'Buatkan rencana belajar 30 hari untuk menjadi data analyst.',
  'Apa yang perlu aku siapkan sebelum melamar magang?',
];

export default function CareerAssistantPage() {
  useDocumentTitle('AI Career Assistant');
  const { data: conversations, setData: setConversations, loading: loadingList, error: listError } = useAsync(() => api.get<Conversation[]>('/assistant/conversations'));
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const openConversation = async (id: number) => {
    setActiveId(id);
    setLoadingConv(true);
    setError(null);
    try {
      const conv = await api.get<Conversation & { messages: ChatMessage[] }>(`/assistant/conversations/${id}`);
      setMessages(conv.messages);
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setLoadingConv(false);
    }
  };

  const newChat = () => {
    setActiveId(null);
    setMessages([]);
    setError(null);
  };

  const send = async (text: string, consent = false) => {
    const message = text.trim();
    if (!message || sending) return;
    setSending(true);
    setError(null);
    const optimistic: ChatMessage = { id: -Date.now(), role: 'user', content: message, meta: null, created_at: new Date().toISOString() };
    setMessages((m) => [...m, optimistic]);
    setInput('');
    try {
      const res = await api.post<{ conversation: Conversation; created: boolean; message: ChatMessage }>('/assistant/chat', {
        message,
        conversation_id: activeId,
        consent,
      });
      setMessages((m) => [...m, res.message]);
      setActiveId(res.conversation.id);
      setConversations((list) => {
        const rest = (list ?? []).filter((c) => c.id !== res.conversation.id);
        return [res.conversation, ...rest];
      });
    } catch (e) {
      const err = e as ApiError;
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      setInput(message); // keep the text so the user can retry
      if (err.code === 'consent_required') {
        setPending(message);
        setConsentOpen(true);
      } else {
        setError(err);
      }
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  const deleteConversation = async () => {
    if (!activeId) return;
    try {
      await api.del(`/assistant/conversations/${activeId}`);
      setConversations((list) => (list ?? []).filter((c) => c.id !== activeId));
      newChat();
    } catch (e) {
      setError(e as ApiError);
    } finally {
      setConfirmDelete(false);
    }
  };

  return (
    <div className="container-page py-6 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary"><Bot className="h-6 w-6" /></div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold sm:text-3xl">AI Career Assistant</h1>
            <span className="chip bg-primary-50 text-primary">Beta</span>
          </div>
          <p className="text-sm text-muted">Tanyakan apa saja seputar karier, pengembangan diri, atau rencana belajarmu.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Conversation history */}
        <aside className="card h-fit p-3 lg:sticky lg:top-24">
          <Button className="w-full" onClick={newChat} icon={<MessageSquarePlus className="h-4 w-4" />}>Percakapan baru</Button>
          <p className="mb-2 mt-4 px-2 text-xs font-bold uppercase tracking-wide text-muted">Riwayat</p>
          {loadingList ? (
            <Spinner label="Memuat…" className="py-4" />
          ) : listError ? (
            <p className="px-2 text-sm text-red-600">{listError.message}</p>
          ) : conversations && conversations.length ? (
            <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => void openConversation(c.id)}
                    className={cn('w-full rounded-xl px-3 py-2 text-left text-sm transition', activeId === c.id ? 'bg-primary-50 font-semibold text-primary' : 'hover:bg-slate-50')}
                  >
                    <span className="line-clamp-1">{c.title}</span>
                    <span className="text-xs text-muted">{formatDate(c.updated_at, true)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-2 py-2 text-sm text-muted">Belum ada percakapan.</p>
          )}
        </aside>

        {/* Chat */}
        <section className="card flex min-h-[60vh] flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-navy">{activeId ? conversations?.find((c) => c.id === activeId)?.title ?? 'Percakapan' : 'Percakapan baru'}</p>
            {activeId && (
              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setConfirmDelete(true)} icon={<Trash2 className="h-4 w-4" />}>Hapus</Button>
            )}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
            {loadingConv ? (
              <Spinner label="Memuat percakapan…" />
            ) : messages.length === 0 ? (
              <div className="mx-auto max-w-lg py-8 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-3 font-semibold text-navy">Mulai dengan pertanyaan</p>
                <p className="mt-1 text-sm text-muted">Asisten akan memakai hasil refleksi terakhirmu sebagai konteks jika tersedia. <Link to="/career-reflection" className="font-semibold text-primary">Isi refleksi</Link></p>
                <div className="mt-5 grid gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => setInput(s)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-left text-sm hover:border-primary/40 hover:bg-primary-50">{s}</button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
                  <div className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full', m.role === 'user' ? 'bg-navy text-white' : 'bg-primary-50 text-primary')}>
                    {m.role === 'user' ? <UserRound className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={cn('max-w-[85%] rounded-2xl px-4 py-3', m.role === 'user' ? 'bg-primary text-white' : 'bg-surface text-ink ring-1 ring-slate-200')}>
                    {m.role === 'assistant' ? <RichText text={m.content} /> : <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>}
                    {m.role === 'assistant' && m.meta && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                        {m.meta.simulated && <SimulationBadge />}
                        {m.meta.used_reflection && <span>Menggunakan konteks refleksimu</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex items-center gap-2 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin text-primary" /> Asisten sedang menyusun jawaban…</div>
            )}
            <div ref={endRef} />
          </div>

          {error && <Alert tone="error" className="mx-4 mb-2">{error.message}</Alert>}

          <form onSubmit={onSubmit} className="border-t border-slate-100 p-3">
            <label htmlFor="chat-input" className="sr-only">Tulis pertanyaan</label>
            <div className="flex items-end gap-2">
              <textarea
                id="chat-input"
                className="input max-h-40 min-h-[48px] resize-none"
                rows={1}
                placeholder="Tulis pertanyaan… (Enter untuk kirim, Shift+Enter untuk baris baru)"
                value={input}
                maxLength={2000}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <Button type="submit" aria-label="Kirim" disabled={!input.trim()} loading={sending} icon={!sending ? <Send className="h-4 w-4" /> : undefined} className="h-12 w-12 shrink-0 px-0" />
            </div>
            <p className="mt-1.5 text-[11px] text-muted">AI dapat keliru. Gunakan jawaban sebagai bahan pertimbangan, bukan keputusan akhir.</p>
          </form>
        </section>
      </div>

      <AiConsentModal
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        onAccept={() => {
          setConsentOpen(false);
          if (pending) void send(pending, true);
          setPending(null);
        }}
      />
      <Modal
        open={confirmDelete}
        title="Hapus percakapan?"
        onClose={() => setConfirmDelete(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Batal</Button>
            <Button variant="danger" onClick={() => void deleteConversation()}>Hapus</Button>
          </>
        }
      >
        Seluruh pesan dalam percakapan ini akan dihapus permanen.
      </Modal>
    </div>
  );
}
