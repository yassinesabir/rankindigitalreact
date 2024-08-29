import React, { useState } from 'react';
import { Layout, Modal, Button } from 'antd';
import { Link } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import './Header.css';
import Logo from '../assets/Icons/Logo2.png';

const { Header } = Layout;

const AntDesignHeader = () => {
  const { keycloak, initialized } = useKeycloak();
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleLogout = () => {
    handleCloseModal(); // Close the modal before logging out
    keycloak.logout();
  };

  return (
    <>
      <Header className="ant-header">
        <div className="logo">
          <Link to="/" className="logo-link">
            <img src={Logo} alt="Webrasma Logo" className="logo-image" />
          </Link>
        </div>
        <div className="user-info">
          {initialized && keycloak.authenticated && keycloak.tokenParsed ? (
            <Button className="user-name-button" onClick={handleShowModal}>
              {keycloak.tokenParsed.preferred_username}
            </Button>
          ) : (
            <Button>Chargement...</Button>
          )}
        </div>
      </Header>

      <Modal
        visible={showModal}
        onCancel={handleCloseModal}
        footer={null}
        centered
        className="custom-modal"
      >
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title">Détails Utilisateur :</div>
          </div>
          <div className="modal-body">
            {keycloak.tokenParsed ? (
              <div className="user-details">
                <p><strong>Nom d'Utilisateur:</strong> {keycloak.tokenParsed.preferred_username}</p>
                <p><strong>Email:</strong> {keycloak.tokenParsed.email}</p>
                <p><strong>Nom Complet:</strong> {keycloak.tokenParsed.name}</p>
              </div>
            ) : (
              <p>Impossible de Charger les Détails de l'Utilisateur.</p>
            )}
          </div>
          <div className="modal-footer">
            <Button type="primary" danger onClick={handleLogout}>
              Se déconnecter
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AntDesignHeader;
