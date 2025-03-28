import React, { useState } from 'react';
import { SSE } from 'sse.js';
import { MdBox } from '@/md-box/full/index';
import styles from './index.module.less';

const Chat: React.FC  = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: '你是一个智能助手' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 追加用户消息
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      // 使用 SSE 发送请求并监听流式数据
      const source = new SSE('https://www.yandaifu.xyz/api/chat', {
        method: 'POST',
        payload: JSON.stringify({ messages: newMessages }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      source.addEventListener('message', (ev: { data: any }) => {
        const chunk = JSON.parse(ev.data); // 解析流式返回的数据
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];

          // 如果最后一条消息是 Assistant，继续拼接
          if (lastMessage?.role === "assistant") {
            return [
              ...prev.slice(0, -1), // 移除最后一条消息
              {
                ...lastMessage,
                content: lastMessage.content + chunk.content, // 拼接新内容
              },
            ];
          } else {
            // 如果不是 assistant（说明是 user），则新增一条 assistant 消息
            return [
              ...prev,
              {
                role: "assistant",
                content: chunk.content,
              },
            ];
          }
        });
      });

      // 监听错误
      source.addEventListener('error', (ev: any) => {
        console.error('SSE 请求错误:', ev);
      })
      // 监听流结束
      // source.addEventListener('readystatechange', (ev: { target: { readyState: number; }; }) => {
      //   if (ev?.target?.readyState === 2) {
      //     setMessages((prev) => [
      //       ...prev,
      //       {
      //         role: 'assistant',
      //         content: prev[prev.length - 1]?.content,
      //       },
      //     ]);
      //   }
      // });

      // 启动 SSE 连接
      source.stream();
    } catch (error) {
      console.error('请求失败:', error);
    }
  };

  return (
    <div className={styles['chat-container']}>
      <div className={styles['chat-message']}>
        {messages.map((msg, index) => (
          <div key={index} className={styles['chat-item']} style={{
            color: '#fff',
            alignSelf: msg.role === "user" ? "flex-end" : "flex-start", // 右对齐 / 左对齐
            display: msg.role === "system" ? "none" : "flex", // 隐藏 system 消息
          }}>
            <MdBox markDown={msg.content} smooth autoFixSyntax mode='dark' />
          </div>
        ))}
      </div>
      <div className={styles['chat-footer']}>
        <textarea
          placeholder="询问任何问题"
          className={styles['chat-input']}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = 'auto'; // 先重置高度，防止高度不减小
            e.target.style.height = e.target.scrollHeight + 'px'; // 设置新的高度
          }}
          rows={1} // 初始行数
          style={{ maxHeight: '150px', overflowY: 'auto' }} // 限制最大高度
          {...({ enterKeyHint: 'send' } as any)} // ✅ 让 TypeScript 忽略 enterKeyHint 类型检查
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault(); // 阻止默认换行行为
              sendMessage(); // 发送消息
            }
          }}
        />
        <button className={styles['send-button']} onClick={sendMessage}>发送</button>
      </div>
    </div>
  );
};

export default Chat;
