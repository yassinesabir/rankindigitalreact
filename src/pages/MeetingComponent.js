import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, DatePicker, TimePicker, Select } from 'antd';
import { DownloadOutlined, UploadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import useAxios from '../security/axiosInstance'; // Import the custom axios instance
import moment from 'moment'; // Import moment for date handling
import { toast, ToastContainer } from 'react-toastify'; // Import react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import default styles
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Import default styles
import './Calendar.css'; // Import custom styles
import 'moment/locale/fr'; // Import French locale for moment

const { Option } = Select;
const localizer = momentLocalizer(moment);

const MyCalendar = () => {
    const [events, setEvents] = useState([]);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [addFormType, setAddFormType] = useState('meeting'); // 'meeting' or 'task'
    const [form] = Form.useForm();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);

    const axiosInstance = useAxios();

    const fetchEvents = async () => {
        try {
            const meetingsResponse = await axiosInstance.get('/meetings');
            const meetings = meetingsResponse.data.map(meeting => ({
                title: meeting.title,
                start: new Date(meeting.dateTime),
                end: new Date(new Date(meeting.dateTime).getTime() + 30 * 60000), // 30 minutes duration
                type: 'meeting',
                leadEmail: meeting.leadEmail,
                plannedBy: meeting.plannedBy,
                id: meeting.id // Include id for delete operation
            }));

            const tasksResponse = await axiosInstance.get('/tasks');
            const tasks = tasksResponse.data.map(task => ({
                title: task.title,
                start: new Date(task.dateTime),
                end: new Date(new Date(task.dateTime).getTime() + 30 * 60000), // 30 minutes duration
                type: 'task',
                responsible: task.responsible,
                description: task.description,
                id: task.id // Include id for delete operation
            }));

            setEvents([...meetings, ...tasks]);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [axiosInstance]);

    const handleExport = async () => {
        try {
            const response = await axiosInstance({
                url: '/export-calendar',
                method: 'GET',
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'meetings.ics');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error exporting meetings:', error);
        }
    };

    const handleImport = async () => {
        if (!importFile) return;

        const formData = new FormData();
        formData.append('file', importFile);

        try {
            const response = await axiosInstance.post('/import-calendar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                toast.success('Meetings imported successfully!');
                setShowImportModal(false);
                setImportFile(null);
                fetchEvents(); // Refresh the events after importing
            } else {
                toast.error(`Failed to import meetings: ${response.data}`);
            }
        } catch (error) {
            console.error('Error importing meetings:', error);
            toast.error(`Failed to import meetings: ${error.response ? error.response.data : error.message}`);
        }
    };

    const handleAdd = async (values) => {
        const { title, date, time, leadEmail, description } = values;
        const dateTime = new Date(`${date.format('YYYY-MM-DD')}T${time.format('HH:mm')}`).toISOString();

        try {
            if (addFormType === 'meeting') {
                await axiosInstance.post('/create-meeting', {
                    title,
                    date: date.format('YYYY-MM-DD'),
                    time: time.format('HH:mm'),
                    leadEmail,
                });
            } else {
                await axiosInstance.post('/add-task', {
                    title,
                    date: date.format('YYYY-MM-DD'),
                    time: time.format('HH:mm'),
                    description
                });
            }

            // Refresh events list
            fetchEvents();

            setShowAddModal(false);
            form.resetFields();
            toast.success('Event added successfully!');
        } catch (error) {
            console.error('Error adding event:', error);
            toast.error('Failed to add event');
        }
    };

    const handleFileChange = (event) => {
        setImportFile(event.target.files[0]);
    };

    const handleAddEventClick = () => {
        // Set the default date to the current date and time for the form
        form.setFieldsValue({
            date: moment(),
            time: moment().set({ hour: 10, minute: 0, second: 0 }), // Set time to 10:00 AM
        });
        setShowAddModal(true);
    };

    const handleModalTypeChange = (type) => {
        setAddFormType(type);
        form.resetFields();
    };

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;

        try {
            if (selectedEvent.type === 'meeting') {
                await axiosInstance.delete(`/meetings/${selectedEvent.id}`);
            } else if (selectedEvent.type === 'task') {
                await axiosInstance.delete(`/tasks/${selectedEvent.id}`);
            }

            // Refresh events list
            fetchEvents();

            setShowEventModal(false);
            toast.success('Event deleted successfully!');
        } catch (error) {
            console.error('Error deleting event:', error);
            toast.error('Failed to delete event');
        }
    };

    const eventStyleGetter = (event) => {
        const today = new Date();
        const eventDate = new Date(event.start);
        const daysUntilEvent = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24)); // Calculate days until event

        let backgroundColor;

        if (event.type === 'meeting') {
            if (eventDate < today) {
                backgroundColor = '#E4E2E2'; // Grey for past meetings
            } else if (daysUntilEvent <= 1) {
                backgroundColor = '#FF280F'; // Red for meetings happening within 1 day
            } else {
                backgroundColor = '#00850D'; // Green color for meetings
            }
        } else if (event.type === 'task') {
            if (eventDate < today) {
                backgroundColor = '#B2B2B2'; // Black for past tasks
            } else if (daysUntilEvent <= 1) {
                backgroundColor = '#FF9494'; // light red for tasks happening within 1 day
            } else {
                backgroundColor = '#90C6A6'; // light green color for tasks
            }
        }

        return {
            style: {
                backgroundColor: backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white', // Change text color for better contrast
                display: 'block',
            }
        };
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    return (
        <div className="calendar-container">
            <ToastContainer /> {/* Include the ToastContainer for Toastify notifications */}
            <div className="calendar-content">
                <div className="calendar-header">
                    <div className="calendar-controls">
                        <Button icon={<UploadOutlined />} onClick={() => setShowImportModal(true)}>
                            Importer
                        </Button>
                        <Button icon={<DownloadOutlined />} onClick={handleExport}>
                            Exporter
                        </Button>
                        <Button icon={<PlusOutlined />} onClick={handleAddEventClick}>
                            Ajouter
                        </Button>
                    </div>
                    <div className="calendar-date-info">
                        <span>{moment(currentDate).locale('fr').format('MMMM YYYY')}</span>
                    </div>
                </div>
                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '80vh' }} // Adjust height as needed
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week']} // Removed year view
                    onNavigate={date => setCurrentDate(date)}
                    onSelectEvent={handleEventClick}
                    date={currentDate}
                    components={{
                        day: {
                            header: (props) => {
                                const today = new Date();
                                return (
                                    <div>
                                        {props.label}
                                        {props.date.toDateString() === today.toDateString() && (
                                            <div className="today-indicator" />
                                        )}
                                    </div>
                                );
                            },
                        },
                    }}
                />
            </div>
            <div className="legend-container">
                <h4>Légende :</h4>
                <div className="legend-item">
                    <div className="legend-color-box" style={{ backgroundColor: '#00850D' }}></div>
                    <span className="legend-text">Rendez-vous Plus qu'un jour</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color-box" style={{ backgroundColor: '#FF280F' }}></div>
                    <span className="legend-text">Rendez-vous Moins qu'un jour</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color-box" style={{ backgroundColor: '#E4E2E2' }}></div>
                    <span className="legend-text">Rendez-vous Passé</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color-box" style={{ backgroundColor: '#90C6A6' }}></div>
                    <span className="legend-text">Tâche Plus qu'un jour</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color-box" style={{ backgroundColor: '#FF9494' }}></div>
                    <span className="legend-text">Tâche Moins qu'un jour</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color-box" style={{ backgroundColor: '#B2B2B2' }}></div>
                    <span className="legend-text">Tâche Passée</span>
                </div>
                <div className="description-text">
                    <h4>Instructions :</h4>
                    <ul>
                      <li>Les fichiers doivent être au format <strong>.ics</strong> pour l'importation.</li>
                      <li>Chaque jour ne peut afficher que <strong>2 événements</strong>. Si vous avez plus de 2 événements, vous pouvez les voir dans la section liée au <strong>weekend</strong>, où le calendrier affichera tous les événements du weekend.</li>
                      <li>Consultez les détails des événements en cliquant sur eux dans le calendrier.</li>
                    </ul>
                </div>
            </div>
            <Modal
                title={addFormType === 'meeting' ? "Ajouter Rendez-vous" : "Ajouter Tâche"}
                visible={showAddModal}
                onOk={() => form.submit()}
                onCancel={() => setShowAddModal(false)}
                okText="Valider"
                cancelText="Annuler"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAdd}
                >
                    <Form.Item>
                        <Select
                            defaultValue="meeting"
                            onChange={handleModalTypeChange}
                        >
                            <Option value="meeting">Rendez-vous</Option>
                            <Option value="task">Tâche</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="title"
                        label="Titre"
                        rules={[{ required: true, message: 'Saisir le titre!' }]}
                    >
                        <Input placeholder="Titre" />
                    </Form.Item>
                    <Form.Item
                        name="date"
                        label="Date"
                        rules={[{ required: true, message: 'Saisir la date!' }]}
                    >
                        <DatePicker locale="fr" />
                    </Form.Item>
                    <Form.Item
                        name="time"
                        label="Heure"
                        rules={[{ required: true, message: 'Saisir l\'heure!' }]}
                    >
                        <TimePicker format="HH:mm" />
                    </Form.Item>
                    {addFormType === 'meeting' && (
                        <>
                            <Form.Item
                                name="leadEmail"
                                label="Email du Lead"
                                rules={[{ required: true, message: 'Saisir l\'email du lead!' }]}
                            >
                                <Input placeholder="Email du Lead" />
                            </Form.Item>
                        </>
                    )}
                    {addFormType === 'task' && (
                        <>
                            <Form.Item
                                name="description"
                                label="Description"
                                rules={[{ required: true, message: 'Saisir la description!' }]}
                            >
                                <Input.TextArea rows={4} />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Modal>
            <Modal
                visible={showImportModal}
                title="Importer des Événements"
                onCancel={() => setShowImportModal(false)}
                footer={[
                    <Button key="cancel" onClick={() => setShowImportModal(false)}>
                        Annuler
                    </Button>,
                    <Button
                        key="import"
                        type="primary"
                        onClick={handleImport}
                        disabled={!importFile}
                    >
                        Importer
                    </Button>
                ]}
            >
                <input type="file" accept=".ics" onChange={handleFileChange} />
            </Modal>
            <Modal
                visible={showEventModal}
                title={selectedEvent?.type === 'meeting' ? "Détails du Rendez-vous" : "Détails de la Tâche"}
                onCancel={() => setShowEventModal(false)}
                footer={[
                    <Button key="delete" type="danger" onClick={handleDeleteEvent}>
                        Supprimer
                    </Button>,
                    <Button key="close" onClick={() => setShowEventModal(false)}>
                        Fermer
                    </Button>
                ]}
            >
                <p><strong>Titre:</strong> {selectedEvent?.title}</p>
                <p><strong>Début:</strong> {moment(selectedEvent?.start).format('LLLL')}</p>
                <p><strong>Fin:</strong> {moment(selectedEvent?.end).format('LLLL')}</p>
                {selectedEvent?.type === 'meeting' && (
                    <p><strong>Créé Par:</strong> {selectedEvent?.plannedBy}</p>
                )}
                {selectedEvent?.type === 'task' && (
                    <p><strong>Responsable:</strong> {selectedEvent?.responsible}</p>
                )}
                {selectedEvent?.type === 'meeting' && (
                    <p><strong>Lead Email:</strong> {selectedEvent?.leadEmail}</p>
                )}
                {selectedEvent?.type === 'task' && (
                    <p><strong>Description:</strong> {selectedEvent?.description}</p>
                )}
            </Modal>
        </div>
    );
};

export default MyCalendar;
