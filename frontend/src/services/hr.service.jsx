import api from './api';

const getJobRequests = () => {
    return api.get('/job-requests/');
};

const getJobRequest = (id) => {
    return api.get(`/job-requests/${id}/`);
};

const updateJobRequest = (id, data) => {
    return api.put(`/job-requests/${id}/`, data);
};

const deleteJobRequest = (id) => {
    return api.delete(`/job-requests/${id}/`);
};

const processJobRequest = (id, action, contract_type = 'indifferent') => {
    return api.post(`/job-requests/${id}/process_request/`, { action, contract_type });
};

const getDashboardStats = () => {
    return api.get('/hr/dashboard-stats/');
};

const getJobPosts = () => {
    return api.get('/job-posts/');
};

const getJobPost = (id) => {
    return api.get(`/job-posts/${id}/`);
};

const updateJobPost = (id, data) => {
    return api.put(`/job-posts/${id}/`, data);
};

const deleteJobPost = (id) => {
    return api.delete(`/job-posts/${id}/`);
};

const getResumes = () => {
    return api.get('/resumes/');
};

const getResume = (id) => {
    return api.get(`/resumes/${id}/`);
};

const updateResume = (id, data) => {
    return api.put(`/resumes/${id}/`, data);
};

const deleteResume = (id) => {
    return api.delete(`/resumes/${id}/`);
};

const getAnalyticsStats = () => {
    return api.get('/analytics-stats/', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
};

const updateResumeStatus = (id, status) => {
    return api.patch(`/resumes/${id}/`, { status });
};

const hrService = {
    getJobRequests,
    getJobRequest,
    updateJobRequest,
    deleteJobRequest,
    processJobRequest,
    getDashboardStats,
    getJobPosts,
    getJobPost,
    updateJobPost,
    deleteJobPost,
    getResumes,
    getResume,
    updateResume,
    deleteResume,
    getAnalyticsStats,
    updateResumeStatus, // Ensure this line is present
};

export default hrService;