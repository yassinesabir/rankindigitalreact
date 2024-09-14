import React, { useState, useCallback } from 'react';
import { Button, Container, Row, Col, Table, Form, Pagination, Modal, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxios from '../../../security/axiosInstance';
import SwipeableRow from './SwipeableRow';
import ImportLeads from './UploadFile';
import './Dash.css';
import nouveauIcon from '../../assets/Icons/NouveauIcon.png';
import enCoursIcon from '../../assets/Icons/EnCoursIcon.png';
import gagneIcon from '../../assets/Icons/GagneIcon.png';
import abandonnéIcon from '../../assets/Icons/Abandonné.png';
import meetingIcon from '../../assets/Icons/MeetingIcon.png'; // Import your meeting icon
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const fetchLeads = async (axiosInstance, searchTerm = '', page = 1, pageSize = 10, filterDateRange = '') => {
  const response = await axiosInstance.get("/Leads");
  const leads = response.data;

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

  let filteredLeads = leads.filter(lead => {
    const leadDate = new Date(lead.dateCreation);
    return leadDate >= startDate;
  });

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
};

const Dashboard = () => {
  const navigate = useNavigate();
  const axiosInstance = useAxios();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [swipedLeadId, setSwipedLeadId] = useState(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [placeholder, setPlaceholder] = useState('Recherche');
  const [filterDateRange, setFilterDateRange] = useState('');
  const [currentLead, setCurrentLead] = useState({});
  const pageSize = 10;

  const { data = {}, refetch } = useQuery({
    queryKey: ['leads', searchTerm, currentPage, filterDateRange],
    queryFn: () => fetchLeads(axiosInstance, searchTerm, currentPage, pageSize, filterDateRange),
    refetchOnWindowFocus: false,
  });

  const { leads = [], total = 0 } = data;

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/Lead/${selectedLeadId}`);
      setShowConfirmModal(false);
      setSwipedLeadId(null);
      refetch();
      toast.success('Lead supprimé avec succès !'); // Show success notification
    } catch (error) {
      console.error(`Error deleting lead: ${error.message}`);
    }
  };

  const handleUpdate = (leadId) => {
    navigate(`/lead/${leadId}`);
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

  const handleDoubleClick = (leadId) => {
    navigate(`/lead/${leadId}/details`);
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
    setCurrentPage(1);
    refetch();
  };

  const formatID = (id) => {
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
  };

  const handleMeetingClick = (lead) => {
    setCurrentLead(lead); // Save the lead details
    setMeetingTitle('');
    setMeetingDate('');
    setMeetingTime('');
    setShowMeetingModal(true);
  };

  const handleMeetingSubmit = async () => {
    try {
      await axiosInstance.post('/create-meeting', {
        title: meetingTitle,
        date: meetingDate,
        time: meetingTime,
        leadId: currentLead.id,
        leadEmail: currentLead.email,
      });
      setShowMeetingModal(false);
      refetch(); // Refetch leads if necessary
      toast.success('Réunion planifiée avec succès !'); // Show success notification
    } catch (error) {
      console.error(`Error scheduling meeting: ${error.message}`);
    }
  };

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
                  <Dropdown.Item onClick={() => handleFilterSelect('lastWeek')}>Cette semaine</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleFilterSelect('lastMonth')}>Ce mois-ci</Dropdown.Item>
                  <Dropdown.Item onClick={() => handleFilterSelect('lastYear')}>Cette année</Dropdown.Item>
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
                <th className="text-center">Réunion</th> {/* Added Meeting Column */}
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
                  <td className="text-center custom-link">
                    <a
                      href={`mailto:${lead.email}`} // Adds the mailto link for Gmail
                      style={{ color: 'inherit', textDecoration: 'none' }} // Optional: inherit color and remove underline
                    >
                      {lead.email}
                    </a>
                  </td>
                  <td className="text-center">{lead.source}</td>
                  <td className="text-center">{lead.entreprise}</td>
                  <td className="text-center">
                    <img
                      src={getStatusIcon(lead.statut)}
                      alt={lead.statut}
                      style={{ width: '24px', height: '24px' }}
                    />
                  </td>
                  <td className="text-center">
                    <img
                      src={meetingIcon}
                      alt="Planifier une réunion"
                      style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                      onClick={() => handleMeetingClick(lead)}
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
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeButton={true} rtl={false} pauseOnFocusLoss draggable pauseOnHover />

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

      {/* Meeting Form Modal */}
      <Modal show={showMeetingModal} onHide={() => setShowMeetingModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Planifier une Réunion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="meetingTitle">
              <Form.Label>Titre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Titre de la réunion"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="meetingDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="meetingTime">
              <Form.Label>Heure</Form.Label>
              <Form.Control
                type="time"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Email du Lead</Form.Label>
              <Form.Control
                type="text"
                value={currentLead.email || ''}
                readOnly
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMeetingModal(false)}>Annuler</Button>
          <Button variant="primary" onClick={handleMeetingSubmit}>Planifier</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;
