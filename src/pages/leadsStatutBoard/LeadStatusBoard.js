import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxios from '../../security/axiosInstance';
import "./LeadStatusBoard.css";

// Import images
import fImage from '../assets/Icons/f-image.png'; // Image for 'F'
import fourImage from '../assets/Icons/4-image.png'; // Image for '4'
import nouveauIcon from '../assets/Icons/NouveauIcon.png';
import enCoursIcon from '../assets/Icons/EnCoursIcon.png';
import gagneIcon from '../assets/Icons/GagneIcon.png';
import abandonnéIcon from '../assets/Icons/Abandonné.png';

const fetchLeads = async (axiosInstance) => {
    const response = await axiosInstance.get("/Leads");
    return response.data;
};

const LeadStatusBoard = () => {
    const axiosInstance = useAxios();
    const queryClient = useQueryClient();
    
    const { data: leads = [], error, isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: () => fetchLeads(axiosInstance),
        refetchOnWindowFocus: false,
    });

    const mutation = useMutation({
        mutationFn: (updatedLead) => axiosInstance.put(`/leads/${updatedLead.id}/status-label`, { statusLabel: updatedLead.statusLabel }),
        onSuccess: () => {
            queryClient.invalidateQueries(['leads']);
        },
        onError: (error) => {
            console.error("Error updating status label", error);
        }
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error fetching leads</div>;

    const handleLabelClick = (leadId, currentLabel) => {
        const nextLabel = currentLabel === "Normal" ? "Intéressant" : currentLabel === "Intéressant" ? "Fidèle" : "Normal";

        const updatedLead = leads.find(lead => lead.id === leadId);
        if (updatedLead) {
            updatedLead.statusLabel = nextLabel;
            mutation.mutate(updatedLead);
        }
    };

    const renderLeadsByStatus = (status) => {
        return leads
            .filter((lead) => lead.statut === status)
            .map((lead) => {
                const statusLabel = lead.statusLabel || "Normal";
                const initial = lead.createdBy ? lead.createdBy.charAt(0).toUpperCase() : "?";
                
                // Determine the image source based on the initial
                let imageSrc = null;
                if (initial === "F") {
                    imageSrc = fImage;
                } else if (initial === "4") {
                    imageSrc = fourImage;
                }

                return (
                    <div key={lead.id} className="lead-item">
                        <div className="lead-tag">{lead.tag}</div>
                        <div className="lead-name">{lead.nom}</div>
                        <div className="lead-footer">
                            <span
                                className={`status-label ${statusLabel.toLowerCase()}`}
                                onClick={() => handleLabelClick(lead.id, statusLabel)}
                            >
                                {statusLabel}
                            </span>
                            <div className="user-circle">
                                {imageSrc ? (
                                    <img src={imageSrc} alt={initial} />
                                ) : (
                                    <div className="default-circle">{initial}</div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            });
    };

    return (
        <div className="lead-status-board">
            <div className="status-column">
                <h3>Nouveau</h3>
                <img src={nouveauIcon} alt="Nouveau Icon" className="status-icon" />
                {renderLeadsByStatus("Nouveau")}
            </div>
            <div className="status-column">
                <h3>En cours</h3>
                <img src={enCoursIcon} alt="En cours Icon" className="status-icon" />
                {renderLeadsByStatus("En cours")}
            </div>
            <div className="status-column">
                <h3>Gagné</h3>
                <img src={gagneIcon} alt="Gagné Icon" className="status-icon" />
                {renderLeadsByStatus("Gagné")}
            </div>
            <div className="status-column">
                <h3>Abandonné</h3>
                <img src={abandonnéIcon} alt="Abandonné Icon" className="status-icon" />
                {renderLeadsByStatus("Abandonné")}
            </div>
        </div>
    );
    
};

export default LeadStatusBoard;
