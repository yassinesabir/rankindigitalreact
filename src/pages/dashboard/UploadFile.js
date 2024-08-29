// ImportLeads.js

import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import useAxios from '../../security/axiosInstance';

const ImportLeads = ({ show, onHide }) => {
    const [file, setFile] = useState(null);
    const axiosInstance = useAxios();

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleImport = async () => {
        if (!file) return;
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            await axiosInstance.post('/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onHide(); // Close modal on success
            alert('Leads imported successfully!');
        } catch (error) {
            console.error('Error importing leads:', error.message);
            alert('Failed to import leads.');
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Importer Nouveau Lead</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formFile">
                        <Form.Label>Sélectionner Fichier Excel</Form.Label>
                        <Form.Control type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Fermer</Button>
                <Button variant="primary" onClick={handleImport}>Importer</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ImportLeads;
