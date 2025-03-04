import api from "./api";

const getJobRequests = () => {
  return api.get("/job-requests/");
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

const processJobRequest = (id, action, contract_type = "indifferent") => {
  return api.post(`/job-requests/${id}/process_request/`, {
    action,
    contract_type,
  });
};

const getDashboardStats = () => {
  return api.get("/hr/dashboard-stats/");
};

const getJobPosts = () => {
  return api.get("/job-posts/");
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

const getApplicants = () => {
  return api.get("/applicants/");
};

const getApplicantDetail = (id) => {
  return api.get(`/applicants/${id}/`);
};

const updateApplicant = (id, data) => {
  return api.put(`/applicant/${id}/`, data);
};

const deleteApplicant = (id) => {
  return api.delete(`/applicant/${id}/`);
};

const getAnalyticsStats = () => {
  return api.get("/analytics-stats/", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};

const updateResumeStatus = (id, status) => {
  return api.patch(`/applicant/${id}/`, { status });
};

const getTeamMembers = () => {
  return api.get("/team/");
};

const createInstantMeeting = (data) => {
  return api.post("/create/", data);
};

const scheduleInterview = (data) => {
  return api.post("/schedule/", data);
};

const sendInterviewInvitation = (data) => {
  return api.post("/send-invitation/", data);
};

const sendScheduleNotification = (data) => {
  return api.post("/notify-schedule/", data);
};

const saveRecording = async (recordingData) => {
  return api.post("/save-recording/", recordingData);
};

const getInterviewRecordings = () => {
  return api.get("/recordings/");
};

const getUpcomingMeetings = () => {
  return api.get("/upcoming/");
};

const getPersonalRoom = () => {
  return api.get("/personal-room/");
};

const joinMeeting = (meetingId) => {
  return api.get(`/join/${meetingId}`);
};

const cancelMeeting = (meetingId) => {
  return api.post(`/cancel-meeting/${meetingId}/`);
};

const getTalentPool = () => {
  return api.get("/talent-pool/");
};

const getCandidates = async () => {
  const response = await getTalentPool();
  return {
    data: response.data.candidates.filter(
      (candidate) =>
        candidate.status === "candidate" && !candidate.first_interview_date
    ),
  };
};

const getSuperCandidates = async () => {
  const response = await getTalentPool();
  return {
    data: response.data.superCandidates.filter(
      (candidate) =>
        candidate.status === "super_candidate" &&
        !candidate.final_interview_date
    ),
  };
};

const updateApplicantStatus = (id, status) => {
  return api.patch(`/applicants/${id}/status/`, { status });
};

const savePerfomanceEvaluation = (id, evaluationData) => {
  return api.post(`/candidates/${id}/evaluation/`, evaluationData);
};

const getPerformanceEvaluation = (applicantId) => {
  return api.get(`/applicants/${applicantId}/evaluation/`);
};

const savePerformanceEvaluation = (applicantId, evaluationData) => {
  return api.post(`/applicants/${applicantId}/evaluation/`, evaluationData);
};

const getNotifications = () => {
  return api.get("/notifications/");
};

const markNotificationAsRead = (notificationId) => {
  return api.patch(`/notifications/${notificationId}/`, { is_read: true });
};

const markAllNotificationsAsRead = () => {
  return api.post("/notifications/mark_all_as_read/");
};

const deleteNotification = (notificationId) => {
  return api.delete(`/notifications/${notificationId}/`);
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
  getApplicants,
  getApplicantDetail,
  updateApplicant,
  deleteApplicant,
  getAnalyticsStats,
  updateResumeStatus,
  getTeamMembers,

  createInstantMeeting,
  scheduleInterview,
  getUpcomingMeetings,
  sendInterviewInvitation,
  sendScheduleNotification,
  saveRecording,
  getInterviewRecordings,
  joinMeeting,
  getPersonalRoom,
  cancelMeeting,

  getTalentPool,
  getCandidates,
  getSuperCandidates,
  updateApplicantStatus,
  savePerfomanceEvaluation,
  getPerformanceEvaluation,
  savePerformanceEvaluation,

  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};

export default hrService;
