import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { postJson } from '../lib/landingApi';

const getVisitorId = () => {
    if (typeof window === 'undefined') {
        return uuidv4();
    }

    let id = localStorage.getItem('visitor_id');
    if (!id) {
        id = uuidv4();
        localStorage.setItem('visitor_id', id);
    }
    return id;
};

const buildWelcomeMessage = (name) => ({
    id: `welcome-${Date.now()}`,
    sender_type: 'admin',
    message: `Hi ${name}. Thanks for reaching out. Send us your question and our team will follow up shortly.`,
    created_at: new Date().toISOString(),
});

const useLiveChat = () => {
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const visitorId = getVisitorId();

    const startConversation = async ({ name = '', email = '' } = {}) => {
        if (conversation) {
            return;
        }

        const visitorName = name.trim();
        const visitorEmail = email.trim().toLowerCase();
        if (!visitorName || !visitorEmail) {
            setError('Name and email are required to start chat.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = await postJson('/api/live-chat/start', {
                visitorId,
                name: visitorName,
                email: visitorEmail,
            });

            const nextConversation = payload.conversation || {
                id: payload.conversationId || visitorId,
                visitor_id: visitorId,
                visitor_name: visitorName,
                visitor_email: visitorEmail,
            };

            setConversation(nextConversation);
            setMessages([payload.message || buildWelcomeMessage(visitorName)]);
        } catch (e) {
            setError(e.message || 'Chat service is temporarily unavailable.');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (text) => {
        const messageText = text.trim();
        if (!messageText || !conversation) {
            return;
        }

        setError(null);

        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const optimisticMessage = {
            id: tempId,
            conversation_id: conversation.id,
            sender_type: 'visitor',
            message: messageText,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const payload = await postJson('/api/live-chat/message', {
                visitorId,
                conversationId: conversation.id,
                name: conversation.visitor_name,
                email: conversation.visitor_email,
                message: messageText,
            });

            setMessages((prev) => prev.map((msg) => (
                msg.id === tempId ? (payload.message || optimisticMessage) : msg
            )));
        } catch (e) {
            setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
            setError(e.message || 'Failed to send message.');
        }
    };

    return {
        conversation,
        messages,
        loading,
        error,
        startConversation,
        sendMessage,
        isConversationReady: !!conversation,
    };
};

export default useLiveChat;
