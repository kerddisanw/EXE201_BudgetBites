import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { chatbotService } from '../services/api';
import './MealAssistantChat.css';

const QUICK_PROMPTS = [
    'Tôi có 300k, nên ăn gì tuần này?',
    'Gợi ý món healthy, ít calo',
    'Tuần này tôi ăn gì?',
    'Kiểm tra trạng thái gói đăng ký của tôi',
    'Hôm nay tôi đặt món gì?'
];

function formatPrice(n) {
    if (n == null || n === '') return '';
    return `${Number(n).toLocaleString('vi-VN')}₫`;
}

const MealAssistantChat = () => {
    const token = localStorage.getItem('token');
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState([]);
    const listRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            const el = listRef.current;
            if (el) el.scrollTop = el.scrollHeight;
        });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, open]);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    const sendMessage = useCallback(async (text) => {
        const trimmed = (text || '').trim();
        if (!trimmed || sending) return;

        setSending(true);
        setInput('');
        const userId = `u-${Date.now()}`;
        const botId = `b-${Date.now()}`;

        setMessages((prev) => [
            ...prev,
            { id: userId, role: 'user', text: trimmed },
            { id: botId, role: 'assistant', pending: true, text: '' }
        ]);

        try {
            const res = await chatbotService.sendMessage(trimmed);
            const data = res.data || {};
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === botId
                        ? {
                              id: botId,
                              role: 'assistant',
                              text: data.reply || 'Không có phản hồi.',
                              suggestedPackages: Array.isArray(data.suggestedPackages)
                                  ? data.suggestedPackages
                                  : [],
                              actions: Array.isArray(data.actions) ? data.actions : [],
                              detectedIntent: data.detectedIntent || ''
                          }
                        : m
                )
            );
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                'Không thể kết nối trợ lý. Vui lòng thử lại.';
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === botId
                        ? {
                              id: botId,
                              role: 'assistant',
                              text: msg,
                              error: true
                          }
                        : m
                )
            );
        } finally {
            setSending(false);
        }
    }, [sending]);

    const onSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    if (!token) return null;

    return (
        <div className="bb-chat-root">
            <button
                type="button"
                className={'bb-chat-fab' + (open ? ' bb-chat-fab-hidden' : '')}
                onClick={() => setOpen(true)}
                aria-label="Mở trợ lý bữa ăn AI"
            >
                <MessageCircle size={26} strokeWidth={2} />
            </button>

            <div
                className={'bb-chat-panel' + (open ? ' bb-chat-panel-open' : '')}
                role="dialog"
                aria-label="Trợ lý bữa ăn AI"
                aria-modal="true"
            >
                <header className="bb-chat-header">
                    <div className="bb-chat-header-title">
                        <span className="bb-chat-header-icon" aria-hidden>
                            <Sparkles size={18} />
                        </span>
                        <div>
                            <h2>Trợ lý bữa ăn</h2>
                            <p>Gợi ý theo ngân sách, thực đơn &amp; gói đăng ký</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="bb-chat-close"
                        onClick={() => setOpen(false)}
                        aria-label="Đóng"
                    >
                        <X size={22} />
                    </button>
                </header>

                <div className="bb-chat-messages" ref={listRef}>
                    {messages.length === 0 && (
                        <div className="bb-chat-welcome">
                            <p className="bb-chat-welcome-lead">
                                Xin chào! Mình là trợ lý BudgetBites — hỏi về ngân sách ăn uống, món
                                healthy, thực đơn tuần, gói đăng ký hoặc đơn hôm nay.
                            </p>
                            <p className="bb-chat-welcome-hint">Gợi ý nhanh:</p>
                            <div className="bb-chat-chips">
                                {QUICK_PROMPTS.map((q) => (
                                    <button
                                        key={q}
                                        type="button"
                                        className="bb-chat-chip"
                                        disabled={sending}
                                        onClick={() => sendMessage(q)}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={
                                'bb-chat-bubble-wrap bb-chat-bubble-wrap-' + (m.role || 'assistant')
                            }
                        >
                            <div
                                className={
                                    'bb-chat-bubble bb-chat-bubble-' +
                                    (m.role || 'assistant') +
                                    (m.error ? ' bb-chat-bubble-error' : '')
                                }
                            >
                                {m.pending ? (
                                    <span className="bb-chat-typing" aria-live="polite">
                                        <span />
                                        <span />
                                        <span />
                                    </span>
                                ) : (
                                    <>
                                        <div className="bb-chat-bubble-text">{m.text}</div>
                                        {m.detectedIntent ? (
                                            <span className="bb-chat-intent">{m.detectedIntent}</span>
                                        ) : null}
                                        {m.suggestedPackages?.length > 0 ? (
                                            <div className="bb-chat-packages">
                                                {m.suggestedPackages.map((pkg) => (
                                                    <Link
                                                        key={pkg.id}
                                                        to="/packages"
                                                        className="bb-chat-package-card"
                                                    >
                                                        {pkg.imageUrl ? (
                                                            <img
                                                                src={pkg.imageUrl}
                                                                alt=""
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="bb-chat-package-ph" />
                                                        )}
                                                        <div className="bb-chat-package-body">
                                                            <strong>{pkg.name}</strong>
                                                            {pkg.partnerName ? (
                                                                <span className="bb-chat-package-partner">
                                                                    {pkg.partnerName}
                                                                </span>
                                                            ) : null}
                                                            <span className="bb-chat-package-price">
                                                                {formatPrice(pkg.price)}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : null}
                                        {m.actions?.length > 0 ? (
                                            <div className="bb-chat-actions">
                                                {m.actions.map((a, i) => (
                                                    <button
                                                        key={`${m.id}-a-${i}`}
                                                        type="button"
                                                        className="bb-chat-action-btn"
                                                        disabled={sending}
                                                        onClick={() => sendMessage(a)}
                                                    >
                                                        {a}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <form className="bb-chat-form" onSubmit={onSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Nhập câu hỏi..."
                        disabled={sending}
                        autoComplete="off"
                        maxLength={2000}
                    />
                    <button
                        type="submit"
                        className="bb-chat-send"
                        disabled={sending || !input.trim()}
                        aria-label="Gửi"
                    >
                        {sending ? (
                            <Loader2 size={20} className="bb-chat-send-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </button>
                </form>
            </div>

            {open ? (
                <button
                    type="button"
                    className="bb-chat-backdrop"
                    aria-label="Đóng trợ lý"
                    onClick={() => setOpen(false)}
                />
            ) : null}
        </div>
    );
};

export default MealAssistantChat;
