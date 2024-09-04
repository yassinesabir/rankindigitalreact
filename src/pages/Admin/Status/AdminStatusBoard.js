import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxios from '../../../security/axiosInstance';
import './LeadStatusBoard.css';

// Import images
import yassine from '../../assets/Icons/a-image.png';
import hasnaa from '../../assets/Icons/b-image.png';
import nouveauIcon from '../../assets/Icons/NouveauIcon.png';
import enCoursIcon from '../../assets/Icons/EnCoursIcon.png';
import gagneIcon from '../../assets/Icons/GagneIcon.png';
import abandonnéIcon from '../../assets/Icons/Abandonné.png';

const fetchLeads = async (axiosInstance) => {
    const response = await axiosInstance.get('/Leads');
    return response.data;
};

const AdminStatusBoard = () => {
    const axiosInstance = useAxios();
    const queryClient = useQueryClient();

    const { data: leads = [], error, isLoading } = useQuery({
        queryKey: ['leads'],
        queryFn: () => fetchLeads(axiosInstance),
        refetchOnWindowFocus: false,
    });

    const mutation = useMutation({
        mutationFn: async (updatedLead) => {
            try {
                const response1 = await axiosInstance.patch(`Lead/${updatedLead.id}`, updatedLead);
                const response2 = await axiosInstance.put(`/leads/${updatedLead.id}/status-label`, {
                    statusLabel: updatedLead.statusLabel,
                });
                return response1.data && response2.data;
            } catch (error) {
                console.error('Error updating lead data', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['leads']);
        },
        onError: (error) => {
            console.error('Error updating lead data', error);
        }
    });

    const handleLabelClick = (leadId, currentLabel) => {
        const LABELS = ["Normal", "Intéressant", "Fidèle"];
        const nextLabel = LABELS[(LABELS.indexOf(currentLabel) + 1) % LABELS.length];
        const leadToUpdate = leads.find(lead => lead.id === leadId);
        if (!leadToUpdate) return;

        const updatedLead = { ...leadToUpdate, statusLabel: nextLabel };
        mutation.mutate(updatedLead);
    };

    const handleDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        const leadIndex = leads.findIndex(lead => lead.id === Number(draggableId));
        if (leadIndex === -1) return;

        const leadToUpdate = leads[leadIndex];
        const updatedLead = {
            ...leadToUpdate,
            statut: destination.droppableId,
        };

        mutation.mutate(updatedLead);
    };

    const calculateEstimatedValueSum = (status) => {
        return leads
            .filter(lead => lead.statut === status)
            .reduce((sum, lead) => sum + (lead.valeurEstimee || 0), 0);
    };

    const renderLeadsByStatus = (status) => {
        const leadsForStatus = leads.filter(lead => lead.statut === status);

        return (
            <>
                <div className="total-value">
                    <span className="line black">Valeur Totale Estimée:</span>
                    <span className="line green">{calculateEstimatedValueSum(status)} MAD</span>
                </div>

                {leadsForStatus.map((lead, index) => (
                    <Draggable key={String(lead.id)} draggableId={String(lead.id)} index={index}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`lead-item ${snapshot.isDragging ? 'dragging' : ''}`}
                            >
                                <div className="lead-tag">{lead.tag || 'No Tag'}</div>
                                <div className="lead-name">{lead.nom || 'No Name'}</div>
                                <div className="lead-value">{lead.valeurEstimee || 'No Value'}</div>
                                <div className="lead-footer">
                                    <span
                                        className={`status-label ${lead.statusLabel ? lead.statusLabel.toLowerCase() : 'normal'}`}
                                        onClick={() => handleLabelClick(lead.id, lead.statusLabel || 'Normal')}
                                    >
                                        {lead.statusLabel || 'Normal'}
                                    </span>
                                    <div className="user-circle">
                                        {lead.createdBy === 'Yassine Sabir' ? (
                                            <img src={yassine} alt="Yassine Sabir" />
                                        ) : lead.createdBy === 'Hasnaa Ettaki' ? (
                                            <img src={hasnaa} alt="Hasnaa Ettaki" />
                                        ) : (
                                            <div className="default-circle">?</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Draggable>
                ))}
            </>
        );
    };

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading leads.</p>;

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="lead-status-board">
                {['Nouveau', 'En cours', 'Gagné', 'Abandonné'].map(status => (
                    <Droppable key={status} droppableId={status}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="status-column"
                            >
                                <h3>{status}</h3>
                                <img
                                    src={
                                        status === 'Nouveau' ? nouveauIcon :
                                        status === 'En cours' ? enCoursIcon :
                                        status === 'Gagné' ? gagneIcon :
                                        abandonnéIcon
                                    }
                                    alt={`${status} Icon`}
                                    className="status-icon"
                                />
                                {renderLeadsByStatus(status)}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
};

export default AdminStatusBoard;
