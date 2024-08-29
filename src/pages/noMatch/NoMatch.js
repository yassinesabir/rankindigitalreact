import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const NoMatch = () => {
    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Row>
                <Col>
                    <Card className="text-center p-4 shadow-lg">
                        <Card.Body>
                            <Card.Title as="h1" className="display-1">404</Card.Title>
                            <Card.Text as="h2">Page Introuvable</Card.Text>
                            <Card.Text>
                            La page que vous recherchez a peut-être été déplacée ou supprimée.
                            </Card.Text>
                            <Button href="/" variant="primary">aller à la page d'accueil</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default NoMatch;
