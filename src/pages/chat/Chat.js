import React, { useEffect, useState, useRef } from 'react';
import keycloak from '../../security/Keycloak';
import { List, Avatar, Input, Button, Layout, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './Chat.css';
import Logo from '../../pages/assets/Icons/Logo.png';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [connected, setConnected] = useState(false);
  const [userList, setUserList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (keycloak?.token) {
      const wsUrl = `ws://localhost:8030/ws/chat?token=${keycloak.token}`;
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('WebSocket connection established');
        setConnected(true);
        fetchUserList();
        fetchBroadcastMessages();
      };

      socketRef.current.onmessage = (event) => {
        const messageData = JSON.parse(event.data);
        if (messageData.broadcast) {
          setBroadcastMessages((prevMessages) => [...prevMessages, messageData]);
        } else {
          setMessages((prevMessages) => [...prevMessages, messageData]);
        }
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
        setConnected(false);
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error', error);
      };

      return () => {
        if (socketRef.current) {
          socketRef.current.close();
        }
      };
    }
  }, [keycloak?.token]);

  useEffect(() => {
    if (selectedUser) {
      fetchChatHistory();
    } else {
      fetchBroadcastMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchChatHistory();
    } else {
      fetchBroadcastMessages();
    }
  }, [searchTerm, selectedUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, broadcastMessages]);

  const fetchUserList = async () => {
    try {
      const response = await fetch('http://localhost:8030/api/chat/users', {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Fetched user list:', data);

      const currentUserName = keycloak.tokenParsed.name;
      const filteredUsers = data.filter((user) => user.name !== currentUserName);

      const usersWithLastMessage = await Promise.all(filteredUsers.map(async (user) => {
        const url = new URL('http://localhost:8030/api/chat/history');
        url.searchParams.append('user1', keycloak.tokenParsed.name);
        url.searchParams.append('user2', user.name);

        try {
          const response = await fetch(url.toString(), {
            headers: {
              Authorization: `Bearer ${keycloak.token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const chatHistory = await response.json();
          const lastMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
          return {
            ...user,
            lastMessage: lastMessage ? lastMessage.message : "Envoyer un message",
            lastMessageTimestamp: lastMessage ? lastMessage.timestamp : null,
          };
        } catch (error) {
          console.error('Error fetching chat history:', error);
          return { ...user, lastMessage: "Envoyer un message", lastMessageTimestamp: null };
        }
      }));

      setUserList(usersWithLastMessage);
    } catch (error) {
      console.error('Error fetching user list:', error);
    }
  };

  const fetchBroadcastMessages = async () => {
    try {
      const response = await fetch('http://localhost:8030/api/chat/broadcasts', {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setBroadcastMessages(data);
    } catch (error) {
      console.error('Error fetching broadcast messages:', error);
    }
  };

  const fetchChatHistory = async () => {
    if (!selectedUser) return;

    try {
      const url = new URL('http://localhost:8030/api/chat/history');
      url.searchParams.append('user1', keycloak.tokenParsed.name);
      url.searchParams.append('user2', selectedUser);

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const sendMessage = () => {
    if (socketRef.current && connected && inputMessage.trim()) {
      const messagePayload = {
        sender: keycloak.tokenParsed.name,
        receiver: selectedUser || null,
        message: inputMessage,
        broadcast: !selectedUser,
        timestamp: new Date().toISOString(),
      };

      socketRef.current.send(JSON.stringify(messagePayload));
      if (selectedUser) {
        // For one-to-one messages
        setMessages((prevMessages) => [
          ...prevMessages,
          messagePayload,
        ]);
      } else {
        // For broadcast messages
        setBroadcastMessages((prevMessages) => [
          ...prevMessages,
          messagePayload,
        ]);
      }
      setInputMessage('');
    }
  };

  const handleUserClick = (name) => {
    setSelectedUser(name);
  };

  const handleTitleClick = () => {
    setSelectedUser(null); // Set selectedUser to null to show broadcast messages
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const truncateMessage = (message, maxLength) => {
    if (message.length > maxLength) {
      return message.substring(0, maxLength) + '...';
    }
    return message;
  };

  const filteredMessages = (selectedUser ? messages : broadcastMessages).filter(message => {
    const messageText = message.message || '';
    return messageText.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const timeDiff = now - date;
    if (timeDiff > 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserInitials = (name) => {
    return name.split(' ').map((part) => part[0]).join('').toUpperCase();
  };

  return (
    <Layout className="chat-container">
      <Sider width={300} className="chat-sider">
        <div className="chat-sider-header">
          <Typography.Title level={4} className="chat-title" onClick={handleTitleClick}>
            Discussion
          </Typography.Title>
        </div>
        <div className="chat-user-list">
          <List
            dataSource={userList}
            renderItem={(user) => (
              <List.Item onClick={() => handleUserClick(user.name)} className="chat-user-list-item">
                <List.Item.Meta
                  avatar={<Avatar className="chat-user-avatar">{getUserInitials(user.name)}</Avatar>}
                  title={user.name}
                  description={
                    <div className="chat-user-list-item-description">
                      <div className="chat-user-list-item-message">
                        {truncateMessage(user.lastMessage, 14)}
                      </div>
                      {user.lastMessageTimestamp && (
                        <div className="chat-user-list-item-timestamp">
                          {formatDate(user.lastMessageTimestamp)}
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
        <div className="chat-sider-footer">
          <img src={Logo} alt="App Logo" className="chat-app-logo" />
          <Typography.Text>Développé Par Yassine & Hasnaa</Typography.Text>
        </div>
      </Sider>
      <Layout className="chat-main">
        <Header className="chat-header">
          <div className="chat-header-title">
            <Typography.Title level={3} className="chat-header-title">
              {selectedUser ? selectedUser : 'Discussion Publique'}
            </Typography.Title>
            <div className="chat-search-container">
              <Input
                className="chat-search-input"
                placeholder="Rechercher des messages..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </Header>
        <Content className="chat-messages-content">
          <div className="chat-messages" ref={chatContainerRef}>
            {filteredMessages.map((message, index) => (
              <div key={index} className={`chat-message ${message.sender === keycloak.tokenParsed.name ? 'chat-message-sent' : 'chat-message-received'}`}>
                <Text strong>{message.sender} :</Text> {message.message}
                <div className="chat-message-timestamp">{formatDate(message.timestamp)}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-message-input">
            <TextArea
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="chat-textarea"
              autoSize={{ minRows: 1, maxRows: 5 }} // Adjust maxRows as needed
            />

            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              disabled={!connected || !inputMessage.trim()}
              className="chat-send-button"
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Chat;
