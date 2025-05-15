import { useState } from 'react';

interface ChatMessage {
    id: string;
    message: string;
    status: 'loading' | 'success' | 'error' | 'local';
}

export const useChat = (activeKey: string) => {
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        // 从localStorage加载历史消息
        const allChats = localStorage.getItem('chat_sessions');
        try {
            const sessions = allChats ? JSON.parse(allChats) : {};
            const saved = sessions[activeKey] || [];
            // 验证数据结构是否匹配messages状态
            if (Array.isArray(saved) && saved.every(msg =>
                msg && typeof msg === 'object' &&
                'id' in msg && 'message' in msg && 'status' in msg
            )) {
                return saved;
            }
            return [];
        } catch {
            return [];
        }
    });

    const onRequest = async (message: string) => {
        try {
            // 添加用户消息
            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                message,
                status: 'local',
            };
            setMessages((prev) => {
                const newMessages = [...prev, userMessage];
                // 确保数据结构一致后再保存
                const allChats = localStorage.getItem('chat_sessions') || '{}';
                const sessions = JSON.parse(allChats);
                sessions[activeKey] = newMessages.map(msg => ({
                    id: msg.id,
                    message: msg.message,
                    status: msg.status
                }));
                localStorage.setItem('chat_sessions', JSON.stringify(sessions));
                return newMessages;
            });

            // 添加AI响应占位
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                message: '',
                status: 'loading',
            };
            setMessages((prev) => {
                const newMessages = [...prev, aiMessage];
                // 确保数据结构一致后再保存
                const allChats = localStorage.getItem('chat_sessions') || '{}';
                const sessions = JSON.parse(allChats);
                sessions[activeKey] = newMessages.map(msg => ({
                    id: msg.id,
                    message: msg.message,
                    status: msg.status
                }));
                localStorage.setItem('chat_sessions', JSON.stringify(sessions));
                return newMessages;
            });

            // 发送请求
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    session_id: activeKey,  // 使用当前会话ID
                    user_host: window.location.hostname  // 获取当前用户主机名
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // 检查响应的Content-Type
            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // 如果不是JSON格式，直接获取文本内容
                const textContent = await response.text();
                data = { message: textContent };
            }

            // 更新AI响应
            setMessages((prev) => {
                const newMessages = prev.map((msg) =>
                    msg.id === aiMessage.id
                        ? { ...msg, message: data.message || data.response || '服务器返回数据格式错误', status: 'success' }
                        : msg
                );
                // 确保数据结构一致后再保存
                const allChats = localStorage.getItem('chat_sessions') || '{}';
                const sessions = JSON.parse(allChats);
                sessions[activeKey] = newMessages.map(msg => ({
                    id: msg.id,
                    message: msg.message,
                    status: msg.status
                }));
                localStorage.setItem('chat_sessions', JSON.stringify(sessions));
                return newMessages;
            });
        } catch (error) {
            // 错误处理
            setMessages((prev) => {
                const newMessages = prev.map((msg) =>
                    msg.id === (prev[prev.length - 1]?.id || '')
                        ? {
                            id: msg.id,
                            message: `请求失败: ${error instanceof Error ? error.message : '未知错误'}`,
                            status: 'error'
                        }
                        : msg
                );
                // 确保数据结构一致后再保存
                const allChats = localStorage.getItem('chat_sessions') || '{}';
                const sessions = JSON.parse(allChats);
                sessions[activeKey] = newMessages.map(msg => ({
                    id: msg.id,
                    message: msg.message,
                    status: msg.status
                }));
                localStorage.setItem('chat_sessions', JSON.stringify(sessions));
                return newMessages;
            });
        }
    };

    return {
        messages,
        setMessages,
        onRequest,
    };
};