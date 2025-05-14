import { Attachments, Bubble, Conversations, Prompts, Sender, Welcome } from '@ant-design/x';
import React, { useEffect } from 'react';
import {
  CloudUploadOutlined,
  CommentOutlined,
  FireOutlined,
  HeartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReadOutlined,
  EditOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import {  Button, Drawer, type GetProp, Space } from 'antd';
import useStyle from './style';
import { useChat } from '../../hooks/useChat';
const renderTitle = (icon: React.ReactElement, title: string) => (
  <Space align="start">
    {icon}
    <span>{title}</span>
  </Space>
);

const defaultConversationsItems = [
  {
    key: '0',
    label: '回答问题1',
  },
];

const placeholderPromptsItems: GetProp<typeof Prompts, 'items'> = [
  {
    key: '1',
    label: renderTitle(<FireOutlined style={{ color: '#FF4D4F' }} />, 'Hot Topics'),
    description: 'What are you interested in?',
    children: [
      {
        key: '1-1',
        description: `What's new in X?`,
      },
      {
        key: '1-2',
        description: `What's AGI?`,
      },
      {
        key: '1-3',
        description: `Where is the doc?`,
      },
    ],
  },
  {
    key: '2',
    label: renderTitle(<ReadOutlined style={{ color: '#1890FF' }} />, 'Design Guide'),
    description: 'How to design a good product?',
    children: [
      {
        key: '2-1',
        icon: <HeartOutlined />,
        description: `Know the well`,
      },
      {
        key: '2-2',
        icon: <SmileOutlined />,
        description: `Set the AI role`,
      },
      {
        key: '2-3',
        icon: <CommentOutlined />,
        description: `Express the feeling`,
      },
    ],
  },
];

const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    typing: { step: 5, interval: 20 },
    styles: {
      content: {
        borderRadius: 16,
        '@media (max-width: 768px)': {
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
        '@media (max-width: 768px)': {
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

  const [content, setContent] = React.useState('');

  const [conversationsItems, setConversationsItems] = React.useState(defaultConversationsItems);

  const [activeKey, setActiveKey] = React.useState(defaultConversationsItems[0].key);

  const [attachedFiles, setAttachedFiles] = React.useState<GetProp<typeof Attachments, 'items'>>(
    [],
  );

  // ==================== Runtime ====================
  const { onRequest, messages, setMessages } = useChat(activeKey);

  useEffect(() => {
    if (activeKey !== undefined) {
      setMessages([]);
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
  };

  const handleFileChange: GetProp<typeof Attachments, 'onChange'> = (info) =>
    setAttachedFiles(info.fileList);

  // ==================== Nodes ====================
  const placeholderNode = (
    <Space direction="vertical" size={24} className={styles.placeholder}>
      <Welcome
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
        title="Hello, I'm Ant Design X"
      />
      <div className="w-full"></div>
    </Space>
  );

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

  const logoNode = (
    <div className={styles.logo}>
      <Button
        type="text"
        className="menu-toggle"
        icon={menuCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => {
          setMenuCollapsed(!menuCollapsed);
          // 在移动端点击时打开抽屉
          if (window.innerWidth <= 768) {
            setDrawerVisible(!drawerVisible);
          }
        }}
      />
    </div>
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
  // ==================== Render =================
  return (
    <div className={styles.layout}>
      {/* 桌面端显示侧边栏 */}
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

      {/* 移动端使用抽屉组件 */}
      <Drawer
        title="会话列表"
        placement="left"
        closable={true}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ header: { borderBottom: '1px solid #f0f0f0' }, body: { padding: 0 } }}
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
          <div className="absolute left-1/2 -translate-x-1/2 top-1/3 -translate-y-1/2 flex justify-center">
            <span className='text-center text-[28px]'>有什么可以帮忙的？</span>
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
              '@media (max-width: 768px)': {
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
