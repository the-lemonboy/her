import { Attachments, Bubble, Conversations, Prompts, Sender, Welcome } from '@ant-design/x';
import React, { useEffect } from 'react';
import {
  CloudUploadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Button, Drawer, type GetProp, Space } from 'antd';
import useStyle from './style';
import { useChat } from '../../hooks/useChat';

const defaultConversationsItems = (() => {
  const allChats = localStorage.getItem('chat_sessions');
  if (allChats) {
    try {
      const sessions = JSON.parse(allChats);
      return Object.entries(sessions).map(([key, messages]) => {
        if (Array.isArray(messages) && messages.length > 0 && messages[0].message) {
          return {
            key,
            label: messages[0].message.substring(0, 6) || `会话${key}`
          };
        }
        return {
          key,
          label: `会话${key}`
        };
      });
    } catch {}
  }
  return [{
    key: '0', 
    label: '回答问题1'
  }];
})();

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    typing: { step: 5, interval: 20 },
    styles: {
      content: {
        borderRadius: 16,
        '@media (maxWidth: 768px)': {
          maxWidth: 'calc(100% - 32px)',
          wordBreak: 'break-word',
        },
      },
    },
  },
  local: {
    placement: 'end',
    variant: 'shadow',
    styles: {
      content: {
        '@media (maxWidth: 768px)': {
          maxWidth: 'calc(100% - 32px)',
          wordBreak: 'break-word',
        },
      },
    },
  },
};

const Independent: React.FC = () => {
  // ==================== Style ====================
  const { styles } = useStyle();

  // ==================== State ====================
  const [headerOpen, setHeaderOpen] = React.useState(false);
  const [menuCollapsed, setMenuCollapsed] = React.useState(false);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState();
  const [content, setContent] = React.useState('');

  const [conversationsItems, setConversationsItems] = React.useState(defaultConversationsItems);

  const [activeKey, setActiveKey] = React.useState(defaultConversationsItems[0].key);

  const [attachedFiles, setAttachedFiles] = React.useState<GetProp<typeof Attachments, 'items'>>(
    [],
  );
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  // ==================== Runtime ====================
  const { onRequest, messages, setMessages } = useChat(activeKey);

  useEffect(() => {
    if (activeKey !== undefined) {
      const allChats = window.localStorage.getItem('chat_sessions');
      try {
        const sessions = allChats ? JSON.parse(allChats) : {};
        const saved = sessions[activeKey] || [];
        setMessages(saved);
      } catch {
        setMessages([]);
      }
    }
  }, [activeKey]);

  // ==================== Event ====================
  const onSubmit = (nextContent: string) => {
    if (!nextContent) return;
    onRequest(nextContent);
    setContent('');
  };

  const onPromptsItemClick: GetProp<typeof Prompts, 'onItemClick'> = (info) => {
    onRequest(info.data.description as string);
  };

  const onAddConversation = () => {
    setConversationsItems([
      ...conversationsItems,
      {
        key: `${conversationsItems.length}`,
        label: `New Conversation ${conversationsItems.length}`,
      },
    ]);
    setActiveKey(`${conversationsItems.length}`);
  };

  const onConversationClick: GetProp<typeof Conversations, 'onActiveChange'> = (key) => {
      setActiveKey(key);
      const historyMsg = window.localStorage.getItem(`chat_${key}`);  // 使用新的key而不是旧的activeKey
      try {
        const parsed = historyMsg ? JSON.parse(historyMsg) : [];
        setMessages(parsed);
      } catch {
        setMessages([]);
      }
  };

  const handleFileChange: GetProp<typeof Attachments, 'onChange'> = (info) =>
    setAttachedFiles(info.fileList);

  // ==================== Nodes ====================

  const items: GetProp<typeof Bubble.List, 'items'> = messages.map(({ id, message, status }) => ({
    key: id,
    loading: status === 'loading',
    role: status === 'local' ? 'local' : 'ai',
    content: message,
  }));

  const senderHeader = (
    <Sender.Header
      title="Attachments"
      open={headerOpen}
      onOpenChange={setHeaderOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={handleFileChange}
        placeholder={(type) =>
          type === 'drop'
            ? { title: 'Drop file here' }
            : {
                icon: <CloudUploadOutlined />,
                title: 'Upload files',
                description: 'Click or drag files to this area to upload',
              }
        }
      />
    </Sender.Header>
  );


  // 会话列表内容
  const conversationsContent = (
    <>
      {/* 🌟 添加会话 */}
      <div className="mt-4 flex justify-between px-2">
        {/* 🌟 会话管理 */}
        <Button
          type="default"
          size="middle"
          icon={menuCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={(e) => {
            // 阻止事件冒泡，避免触发父元素的点击事件
            e.stopPropagation();
            if(isMobile){
              setDrawerVisible(!drawerVisible);
            }else{
              setMenuCollapsed(!menuCollapsed);
            }
          }}
        />
        <Button
          onClick={onAddConversation}
          className={styles.addBtn}
          icon={<EditOutlined />}
          size="middle"
          type="default"
        ></Button>
      </div>
      <Conversations
        items={conversationsItems}
        className={styles.conversations}
        activeKey={activeKey}
        onActiveChange={(key) => {
          onConversationClick(key);
          // 在移动端选择会话后关闭抽屉
          if (window.innerWidth <= 768) {
            setDrawerVisible(false);
          }
        }}
      />
    </>
  );
  const collapsedMenu = (
    <div className="absolute left-2 top-2">
      <div className="mt-2 flex justify-between px-2">
        {/* 🌟 会话管理 */}
        <Button
          type="default"
          size="middle"
          icon={menuCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={(e) => {
            // 阻止事件冒泡，避免触发父元素的点击事件
            e.stopPropagation();
            setMenuCollapsed(!menuCollapsed);
          }}
        />
        <Button
          onClick={onAddConversation}
          className={styles.addBtn}
          icon={<EditOutlined />}
          size="middle"
          type="default"
        ></Button>
      </div>
    </div>
  );
  const mobileMenu = (
    <div className="w-screen">
      <div className="mt-4 flex justify-between px-4">
        {/* 🌟 会话管理 */}
        <Button
          type="default"
          size="middle"
          icon={menuCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => {
            setDrawerVisible(!drawerVisible);
          }}
        />
        <Button
          onClick={onAddConversation}
          // className={styles.addBtn}
          icon={<EditOutlined />}
          size="middle"
          type="default"
        ></Button>
      </div>
    </div>
  );
  // ==================== Render =================
  return (
    <div className={styles.layout}>
      {!isMobile && (
        <div className={`${styles.menu} ${menuCollapsed ? 'collapsed' : ''}`}>
          {/* 在桌面端直接显示会话列表 */}
          {!menuCollapsed && (
            <div
              className="desktop-only"
              style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              {conversationsContent}
            </div>
          )}
          {menuCollapsed && collapsedMenu}
        </div>
      )}
      {isMobile && mobileMenu}
      {/* 移动端使用抽屉组件 */}
      <Drawer
        placement="left"
        open={drawerVisible}
        styles={{ body: { padding: 0 } }}
        title={null}
        closable={false}
        width={200}
        // 只在移动端显示
        className="mobile-drawer"
      >
        {conversationsContent}
      </Drawer>
      <div className={styles.chat}>
        {/* 🌟 消息列表 */}
        {items.length > 0 && (
          <Bubble.List items={items} roles={roles} className={styles.messages} />
        )}
        {items.length === 0 && (
          <div className="justify-center flex flex-1 items-center">
            <span className="text-center text-2xl text-nowrap justify-center">有什么可以帮忙的？</span>
          </div>
        )}
        {/* 🌟 输入框 */}
        <Sender
          value={content}
          header={senderHeader}
          onSubmit={onSubmit}
          onChange={setContent}
          loading={messages.length > 0 && messages[messages.length - 1].status === 'loading'}
          className={styles.sender}
          styles={{
            container: {
              '@media (maxWidth: 768px)': {
                borderRadius: '16px',
                margin: '0 4px 8px',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Independent;
