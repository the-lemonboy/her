import { createStyles } from 'antd-style';

const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
        width: 100%;
        height: 100vh;
        border-radius: ${token.borderRadius}px;
        display: flex;
        background: ${token.colorBgContainer};
        font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;
        overflow: hidden;
        
        @media (max-width: 768px) {
          flex-direction: column;
        }
  
        .ant-prompts {
          color: ${token.colorText};
        }
        
        .mobile-drawer {
          @media (min-width: 769px) {
            display: none !important;
          }
          
          .ant-drawer-content-wrapper {
            width: 280px !important;
          }
        }
      `,
    menu: css`
        background: ${token.colorBgLayout}80;
        width: 280px;
        height: 100%;
        display: flex;
        flex-direction: column;
        transition: all 0.3s;
        
        &.collapsed {
          width: 0px;
          overflow: hidden;
          
          .desktop-only {
            display: none;
          }
        }
        
        @media (max-width: 768px) {
          width: 100%;
          height: auto;
          max-height: 60px;
          overflow: hidden;
        }
        
        .desktop-only {
          @media (max-width: 768px) {
            display: none !important;
          }
        }
      `,
    conversations: css`
        padding: 0 12px;
        flex: 1;
        overflow-y: auto;
      `,
    // btnCollapsed: css`
    //     position: absolute;
    //     left: 0;
    //     top: 0;
    //     width:50px;
    //   `,
    chat: css`
        height: 100%;
        width: 100%;
        max-width: 700px;
        margin: 0 auto;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        padding: ${token.paddingLG}px;
        gap: 16px;
        position: relative;
        @media (max-width: 768px) {
          padding: ${token.padding}px;
          max-width: 100%;
          flex: 1;
          overflow: hidden;
        }
      `,
    messages: css`
        flex: 1;
        overflow-y: auto;
        
        @media (max-width: 768px) {
          padding-bottom: 8px;
        }
      `,
    placeholder: css`
        padding-top: 32px;
        
        @media (max-width: 768px) {
          padding-top: 16px;
        }
      `,
    sender: css`
        box-shadow: ${token.boxShadow};
        position: absolute;
        bottom: 50%;
        left:50%;
        transform: translate(-50%,-50%);
        width: calc(100% - 24px);
        @media (max-width: 768px) {
          margin-top: auto;
        }
      `,
    logo: css`
        display: flex;
        height: 60px;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        box-sizing: border-box;
        
        @media (max-width: 768px) {
          height: 48px;
          padding: 0 12px;
          justify-content: center;
        }
  
        img {
          width: 24px;
          height: 24px;
          display: inline-block;
        }
  
        span {
          display: inline-block;
          margin: 0 8px;
          font-weight: bold;
          color: ${token.colorText};
          font-size: 16px;
        }
        
        .menu-toggle {
          display: none;
          
          @media (max-width: 768px) {
            display: block;
            position: absolute;
            left: 12px;
            font-size: 18px;
          }
        }
      `,
    addBtn: css`
        background: #1677ff0f;
        border: 1px solid #1677ff34;
        width: 30px;
        /* width: calc(100% - 24px); */
        margin: 0 12px 24px 12px;
        
        @media (max-width: 768px) {
          margin: 0 12px 12px 12px;
        }
      `,
    conversationHeader: css`
        padding: 0 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        margin-bottom: 8px;
        color: ${token.colorTextSecondary};
        
        &:hover {
          color: ${token.colorPrimary};
        }
      `,
  };
});


export default useStyle;