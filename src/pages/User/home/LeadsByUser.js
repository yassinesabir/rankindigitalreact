import React, { useState, useCallback } from 'react';
import { Button, Container, Row, Col, Table, Form, Pagination, Modal, Dropdown, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxios from '../../../security/axiosInstance';
import { useKeycloak } from '@react-keycloak/web'; // Keycloak hook
import SwipeableRow from '../../Admin/home/SwipeableRow';
import ImportLeads from '../../Admin/home/UploadFile'; // Import the new component
import '../../Admin/home/Dash.css';

import nouveauIcon from '../../assets/Icons/NouveauIcon.png';
import enCoursIcon from '../../assets/Icons/EnCoursIcon.png';
import gagneIcon from '../../assets/Icons/GagneIcon.png';
import abandonnéIcon from '../../assets/Icons/Abandonné.png';


const fetchLeadsByUser = async (axiosInstance, keycloakToken, searchTerm = '', page = 1, pageSize = 10, filterDateRange = '') => {
  try {
    const response = await axiosInstance.get('/user', {
      headers: {
        'Authorization': `Bearer ${keycloakToken}`
      }
    });

    const leads = response.data;
    console.log('Fetched Leads:', leads); // Debugging

    const today = new Date();
    let startDate;

    switch (filterDateRange) {
      case 'today':
        startDate = new Date(today.setHours(0, 0, 0, 0));
        break;
      case 'lastWeek':
        startDate = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'lastMonth':
        startDate = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case 'lastYear':
        startDate = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
      default:
        startDate = new Date('1970-01-01'); // No date filter
    }

    let filteredLeads = leads.filter(lead => new Date(lead.dateCreation) >= startDate);

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredLeads = filteredLeads.filter(lead =>
        lead.nom.toLowerCase().includes(lowerCaseSearchTerm) ||
        lead.source.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    filteredLeads.sort((a, b) => b.id - a.id);

    return {
      leads: filteredLeads.slice((page - 1) * pageSize, page * pageSize),
      total: filteredLeads.length
    };
  } catch (error) {
    console.error('Error fetching leads:', error.response ? error.response.data : error.message);
    return { leads: [], total: 0 };
  }
};

const LeadsByUser = () => {
  const navigate = useNavigate();
  const axiosInstance = useAxios();
  const { keycloak } = useKeycloak(); // Ensure keycloak is defined here
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [swipedLeadId, setSwipedLeadId] = useState(null);
  const [placeholder, setPlaceholder] = useState('Recherche');
  const [filterDateRange, setFilterDateRange] = useState('');
  const pageSize = 10;

  const { data = {}, refetch } = useQuery({
    queryKey: ['leadsByUser', searchTerm, currentPage, filterDateRange, keycloak?.token],
    queryFn: () => fetchLeadsByUser(axiosInstance, keycloak?.token, searchTerm, currentPage, pageSize, filterDateRange),
    refetchOnWindowFocus: false,
  });

  const { leads = [], total = 0 } = data;

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/Lead/${selectedLeadId}`, {
        headers: {
          'Authorization': `Bearer ${keycloak?.token}`
        }
      });
      setShowConfirmModal(false);
      setSwipedLeadId(null); // Reset swiped lead ID
      refetch();
      setShowToast(true); // Show toast notification
    } catch (error) {
      console.error(`Error deleting lead: ${error.message}`);
    }
  };

  const handleUpdate = (leadId) => {
    navigate(`/lead/${leadId}`);
  };

  const handleDoubleClick = (leadId) => {
    navigate(`/lead/${leadId}/details`);
  };

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
    refetch();
  }, [refetch]);

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    refetch();
  };

  const handleSwipeLeft = (leadId) => {
    setSelectedLeadId(leadId);
    setSwipedLeadId(leadId);
    setShowConfirmModal(true);
  };

  const handleSwipeRight = (leadId) => {
    handleUpdate(leadId);
  };

  const handleFocus = () => {
    setPlaceholder('');
  };

  const handleBlur = () => {
    if (!searchTerm) {
      setPlaceholder('Recherche');
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'Nouveau':
        return nouveauIcon;
      case 'En cours':
        return enCoursIcon;
      case 'Gagné':
        return gagneIcon;
      case 'Abandonné':
        return abandonnéIcon;
      default:
        return null;
    }
  };

  const handleFilterSelect = (range) => {
    setFilterDateRange(range);
    setCurrentPage(1); // Reset to first page when filter changes
    refetch();
  };

  function formatID(id) {
    const LETTERS_PER_GROUP = 100;
    const ALPHABET_LENGTH = 26;
    const groupIndex = Math.floor(id / LETTERS_PER_GROUP);
    let prefix = '';
    let remainingGroupIndex = groupIndex;

    while (remainingGroupIndex >= 0) {
      const letter = String.fromCharCode(remainingGroupIndex % ALPHABET_LENGTH + 65);
      prefix = letter + prefix;
      remainingGroupIndex = Math.floor(remainingGroupIndex / ALPHABET_LENGTH) - 1;
    }

    prefix = prefix.padStart(1, 'A');
    const numericPart = id % LETTERS_PER_GROUP;
    const formattedNumericPart = numericPart.toString().padStart(3, '0');

    return `${prefix}${formattedNumericPart}`;
  }

  return (
    <Container className="nt-S">
      <Row>
        <Col>
          <h1 className="title">Leads</h1>
          <div className="search-bar-container">
            <div className="buttons-container">
              <Button variant="primary" className="mr-2" onClick={() => navigate('/Lead')}>Ajouter</Button>
              <Button variant="success" className="mr-2" onClick={() => setShowImportModal(true)}>Importer</Button>
            </div>
            <div className="search-bar">
              <Form.Control
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div className="icon-container">
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic"></Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleFilterSelect('today')}>Aujourd'hui</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleFilterSelect('lastWeek')}>Semaine Dernière</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleFilterSelect('lastMonth')}>Mois Dernier</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleFilterSelect('lastYear')}>Année Dernière</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleFilterSelect('')}>Tout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
          <Table bordered hover responsive className="custom-table">
            <thead>
              <tr>
                <th className="text-center">Id</th>
                <th className="text-center">Nom</th>
                <th className="text-center">Email</th>
                <th className="text-center">Source</th>
                <th className="text-center">Entreprise</th>
                <th className="text-center">Statut</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <SwipeableRow
                  key={lead.id}
                  onSwipeLeft={() => handleSwipeLeft(lead.id)}
                  onSwipeRight={() => handleSwipeRight(lead.id)}
                  onDoubleClick={() => handleDoubleClick(lead.id)}
                  isModalOpen={showConfirmModal && lead.id === swipedLeadId}
                >
                  <td className="text-center">{formatID(lead.id)}</td>
                  <td className="text-center">{lead.nom}</td>
                  <td className="text-center">{lead.email}</td>
                  <td className="text-center">{lead.source}</td>
                  <td className="text-center">{lead.entreprise}</td>
                  <td className="text-center">
                    <img
                      src={getStatusIcon(lead.statut)}
                      alt={lead.statut}
                      style={{ width: '24px', height: '24px' }}
                    />
                  </td>
                </SwipeableRow>
              ))}
            </tbody>
          </Table>
          <Pagination className="justify-content-center">
            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </Col>
      </Row>

      {/* Toast Notification */}
      <ToastContainer className="toast-container">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={3000}
          autohide
          bg="success"
          className="text-white"
        >
          <Toast.Body>Lead supprimé avec succès !</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Confirm Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir supprimer ce lead ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
        </Modal.Footer>
      </Modal>

      {/* Import Leads Modal */}
      <ImportLeads show={showImportModal} onHide={() => setShowImportModal(false)} />
    </Container>
  );
};

export default LeadsByUser;
