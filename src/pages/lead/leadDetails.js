import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Button, Alert } from 'react-bootstrap';
import useAxios from '../../security/axiosInstance';
import nouveauIcon from '../assets/Icons/NouveauIcon.png';
import enCoursIcon from '../assets/Icons/EnCoursIcon.png';
import gagneIcon from '../assets/Icons/GagneIcon.png';
import abandonnéIcon from '../assets/Icons/Abandonné.png';
import './leadDetails.css'; // Ensure this file includes your updated CSS

const statusIcons = {
  "Nouveau": nouveauIcon,
  "En cours": enCoursIcon,
  "Gagné": gagneIcon,
  "Abandonné": abandonnéIcon
};

const LeadDetails = () => {
  const { leadId } = useParams();
  const axiosInstance = useAxios();
  const [lead, setLead] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchLead = useCallback(async () => {
    if (!leadId) return;
    try {
      const response = await axiosInstance.get(`/Lead/${leadId}`);
      setLead(response.data);
    } catch (err) {
      console.error('Error fetching lead details:', err);
      setError('Failed to fetch lead details.');
    }
  }, [leadId, axiosInstance]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleExportPdf = async () => {
    try {
      const response = await axiosInstance.get(`/Lead/${leadId}/export-pdf`, {
        responseType: 'blob',  // Important to specify blob for binary data
      });

      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = `lead-${leadId}.pdf`;  // Optional: use a specific filename
        link.click();
        window.URL.revokeObjectURL(fileURL);
      } else {
        throw new Error(`Failed to export PDF. Status code: ${response.status}`);
      }
    } catch (err) {
      console.error('Error exporting PDF:', err.message);
      setError('Failed to export PDF: ' + err.message);
    }
  };

  return (
    <Container className="lead-details-container">
      <div className="details-title">
        <h2>Lead Details</h2>
      </div>
      {lead ? (
        <div className="details-content">
          <div className="details-left">
            <div className="details-group">
              <label>Name:</label>
              <p>{lead.nom}</p>
            </div>
            <div className="details-group">
              <label>Email:</label>
              <p>{lead.email}</p>
            </div>
            <div className="details-group">
              <label>Source:</label>
              <p>{lead.source}</p>
            </div>
            <div className="details-group">
              <label>Entreprise:</label>
              <p>{lead.entreprise}</p>
            </div>
            <div className="details-group">
              <label>Statut:</label>
              <div>
                <img
                  src={statusIcons[lead.statut] || ''}
                  alt={lead.statut}
                  style={{ width: '54px', height: '54px' }}
                />
                <span>{lead.statut}</span>
              </div>
            </div>
          </div>
          <div className="details-right">
            <div className="details-group">
              <label>Téléphone:</label>
              <p>+212 {lead.telephone}</p>
            </div>
            <div className="details-group">
              <label>Téléphone:</label>
              <p>{lead.valeurEstimee} MAD</p>
            </div>
            <div className="details-group">
              <label>Description:</label>
              <div className="description-container">
                <p>{lead.description}</p>
              </div>
            </div>
            <Button className="mt-3" onClick={handleExportPdf}>
              Export PDF
            </Button>
          </div>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
        </div>
      ) : (
        <p>Chargement...</p>
      )}
    </Container>
  );
};

export default LeadDetails;
