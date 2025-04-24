import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Alert, Spinner } from 'react-bootstrap';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const key = searchParams.get('key');
        if (key) {
            axios.post('/accounts/confirm-email/', { key })
                .then(response => {
                    setMessage('Email verified successfully!');
                })
                .catch(error => {
                    setMessage('Email verification failed. Please try again.');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setMessage('Invalid verification link.');
            setLoading(false);
        }
    }, [searchParams]);

    return (
        <Container className="mt-5">
            {loading ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            ) : (
                <Alert variant={message.includes('successfully') ? 'success' : 'danger'}>
                    {message}
                </Alert>
            )}
        </Container>
    );
};

export default EmailVerification;