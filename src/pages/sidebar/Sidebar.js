import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import growth from '../assets/Icons/growth.png';
import calendar from '../assets/Icons/Calendar.png';
import leads from '../assets/Icons/Leads.png';
import test from '../assets/Icons/test.png';
import bullhorn from '../assets/Icons/bullhorn.png';
import chatting from '../assets/Icons/chatting.png';
import bell from '../assets/Icons/bell.png';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Button, Menu } from 'antd';
import './Sidebar.css'; // Import CSS file

const imageIcon = (src) => <img src={src} alt="icon" style={{ width: '24px', height: '24px' }} />;

const items = [
  { key: '1', icon: imageIcon(leads), label: 'Liste des Leads', link: '/' },
  { key: '2', icon: imageIcon(test), label: 'Statuts Leads', link: '/Statuts' },
  { key: '3', icon: imageIcon(growth), label: 'Statistiques', link: '/Dashboards' },
  { key: '4', icon: imageIcon(bullhorn), label: 'Publicités', link: '/Ads' },
  { key: '5', icon: imageIcon(calendar), label: 'Calendrier', link: '/Calendar' },
  { key: '6', icon: imageIcon(bell), label: 'Notification', link: '/Notification' },
  { key: '7', icon: imageIcon(chatting), label: 'Messagerie', link: '/chat' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(true); // Start with collapsed state
  const navigate = useNavigate();
  
  const handleMenuClick = (e) => {
    const item = items.find(item => item.key === e.key);
    if (item) navigate(item.link);
  };

  const toggleCollapsed = () => setCollapsed(!collapsed);

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`} >
      <Menu
        defaultSelectedKeys={['1']}
        mode="inline"
        theme="light"
        inlineCollapsed={collapsed}
        items={items}
        onClick={handleMenuClick}
      />
      <Button
        type="primary"
        onClick={toggleCollapsed}
        className="sidebar-toggle"
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>
    </div>
  );
};

export default Sidebar;
