import React, { useState, useEffect } from 'react';
import useAxios from '../security/axiosInstance'; // Import your axios instance hook
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS
import './Notification.css';

const Notification = () => {
    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });
    const [leads, setLeads] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [notificationMode, setNotificationMode] = useState('all'); // Add state for notification mode
    const [filteredLeads, setFilteredLeads] = useState([]);
    const navigate = useNavigate();
    const axiosInstance = useAxios(); // Get the axios instance

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const response = await axiosInstance.get('/leads'); // Adjust the endpoint as necessary
                setLeads(response.data);
                setFilteredLeads(response.data);
            } catch (error) {
                console.error('Error fetching leads:', error);
                toast.error('Erreur lors de la récupération des leads');
            }
        };

        const fetchSubjects = async () => {
            try {
                const response = await axiosInstance.get('/email-subjects'); // Adjust the endpoint as necessary
                setSubjects(response.data);
            } catch (error) {
                console.error('Error fetching subjects:', error);
                toast.error('Erreur lors de la récupération des sujets');
            }
        };

        fetchLeads();
        fetchSubjects();
    }, [axiosInstance]);

    useEffect(() => {
        if (searchTerm) {
            setFilteredLeads(leads.filter(lead => lead.email.toLowerCase().includes(searchTerm.toLowerCase())));
        } else {
            setFilteredLeads(leads);
        }
    }, [searchTerm, leads]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSelectLeads = (event) => {
        const options = event.target.options;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                const selectedLead = leads.find(lead => lead.email === options[i].value);
                if (selectedLead) {
                    selectedValues.push(selectedLead);
                }
            }
        }
        setSelectedLeads(selectedValues);
    };

    const handleNotificationModeChange = (event) => {
        setNotificationMode(event.target.value);
        if (event.target.value === 'all') {
            setSelectedLeads([]);
        }
    };

    const handleRemoveLead = (email) => {
        setSelectedLeads(selectedLeads.filter(lead => lead.email !== email));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('jwtToken'); // Retrieve the JWT token from localStorage or context
            await axiosInstance.post('/send-notification', {
                leads: notificationMode === 'all' ? leads.map(lead => lead.id) : selectedLeads.map(lead => lead.id),
                subject: formData.subject,
                message: formData.message
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // Set the Authorization header with the JWT token
                }
            });
            toast.success('Notification envoyée avec succès!');
            setTimeout(() => navigate("/"), 2000);
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error('Erreur lors de l\'envoi de la notification');
        }
    };

    return (
        <div className="notification-container">
            <h2>Envoyer Notification</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="subject">Sujet</label>
                        <select
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Sélectionner un sujet</option>
                            {subjects.map((subject, index) => (
                                <option key={index} value={subject}>
                                    {subject}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notificationMode">Mode d'envoi</label>
                        <select
                            id="notificationMode"
                            name="notificationMode"
                            value={notificationMode}
                            onChange={handleNotificationModeChange}
                            required
                        >
                            <option value="all">Envoyer à tous les leads</option>
                            <option value="selected">Sélectionner les leads</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="4"
                        required
                    />
                </div>

                {notificationMode === 'selected' && (
                    <div className="form-row">
                        <div className="form-group leads-list-container">
                            <div className="form-group search-container">
                                <label htmlFor="search">Rechercher des leads</label>
                                <input
                                    type="text"
                                    id="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Rechercher par email"
                                />
                            </div>
                            <label htmlFor="leads">Sélectionner les leads</label>
                            <select
                                id="leads"
                                multiple
                                onChange={handleSelectLeads}
                            >
                                {filteredLeads.map((lead) => (
                                    <option key={lead.id} value={lead.email}>
                                        {lead.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group selected-leads-box">
                            <h4>Leads sélectionnés</h4>
                            {selectedLeads.length === 0 ? (
                                <p>Aucun lead sélectionné</p>
                            ) : (
                                selectedLeads.map(lead => (
                                    <div key={lead.email} className="selected-lead">
                                        {lead.email}
                                        <button type="button" onClick={() => handleRemoveLead(lead.email)} className="remove-button">
                                            &times;
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                <button type="submit" className="submit-button">
                    Envoyer
                </button>
            </form>
            <ToastContainer /> {/* Ensure ToastContainer is present */}
        </div>
    );
};

export default Notification;
