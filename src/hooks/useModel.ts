
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { useState } from "react";
// 模型初始化
export default function useModel(inputText) {
    const model = new ChatOpenAI({
        modelName: "deepseek-chat",
        openAIApiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
        configuration: {
            baseURL: "https://api.deepseek.com/v1",
        },
        temperature: 0.7,
        maxTokens: 1000,
        dangerouslyAllowBrowser: true
    });
    // 输入验证
    const validateInput = (text: string) => {
        if (!text.trim()) throw new Error("输入不能为空");
        if (text.length > 1000) throw new Error("问题长度超过1000字符限制");
        if (/[<>]/.test(text)) throw new Error("包含非法字符<>");
    };
    const [messages, setMessages] = useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // 核心交互逻辑
    const handleSubmit = async () => {
        try {
            // 状态重置
            setErrorMessage('');
            setIsLoading(true);

            // 输入验证
            validateInput(inputText);

            // 添加用户消息
            setMessages([
                ...messages,
                {
                    type: 'human',
                    content: inputText
                }
            ]);

            // 发送请求
            const response = await model.invoke([
                new HumanMessage(inputText.value)
            ]);

            // 添加AI响应
            messages.push({
                type: 'ai',
                content: response.content
            });

            // 更新速率限制
            rateLimit.remaining--;

        } catch (error: any) {
            // 错误处理
            setErrorMessage(error.message || '请求发生未知错误');
            console.error('API错误详情:', error.response?.data || error);
        } finally {
            // 状态清理
            setIsLoading(false);
        }
    };
    return {
        isLoading,
        errorMessage,
        messages,
        handleSubmit
    }
}