import React from 'react';
import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './styles/PdfViewer.css';

const PdfViewer = () => {
    const [searchParams] = useSearchParams();
    const fileUrl = searchParams.get('url');
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const navigate = useNavigate();

    if (!fileUrl) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">No PDF URL provided</Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="pdf-viewer-container">
            <Button variant="secondary" className="mb-3" onClick={() => navigate(-1)}>
                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                Go Back
            </Button>
            <div className="pdf-viewer shadow-lg p-3 mb-5 bg-white rounded">
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.0.279/build/pdf.worker.min.js">
                    <div className="pdf-container">
                        <Viewer
                            fileUrl={fileUrl}
                            plugins={[defaultLayoutPluginInstance]}
                            defaultScale={1.5}
                        />
                    </div>
                </Worker>
            </div>
        </Container>
    );
};

export default PdfViewer;