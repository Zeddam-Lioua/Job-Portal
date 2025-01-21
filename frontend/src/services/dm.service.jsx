// src/services/dm.service.jsx - API service for District Manager operations
import api from './api';

const dmService = {
  /**
   * Fetch job requests submitted by the DM.
   * @returns {Promise} A promise resolving to the job requests data.
   */
  getJobRequests: async () => {
    try {
      const response = await api.get('/job-requests/'); // Ensure this endpoint exists
      return response.data;
    } catch (error) {
      console.error('Error fetching job requests:', error);
      throw error;
    }
  },

  /**
   * Create a new job request.
   * @param {Object} requestData - Data for the new job request.
   * @returns {Promise} A promise resolving to the created request data.
   */
  createJobRequest: async (requestData) => {
    try {
      const response = await api.post('/job-requests/', requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating job request:', error);
      throw error;
    }
  },


  /**
   * Delete a job request by its ID.
   * @param {number} requestId - ID of the job request to delete.
   * @returns {Promise} A promise resolving when the request is deleted.
   */
  deleteJobRequest: async (requestId) => {
    try {
      await api.delete(`/job-requests/${requestId}/`);
    } catch (error) {
      console.error('Error deleting job request:', error);
      throw error;
    }
  },
};

export default dmService;