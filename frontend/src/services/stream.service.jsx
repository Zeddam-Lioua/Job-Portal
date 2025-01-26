import api from "./api";

const streamService = {
  generateChatToken: async (userId) => {
    try {
      const response = await api.get(`/generate_stream_chat_token/${userId}/`);
      return response.data;
    } catch (error) {
      console.error("Error generating chat token:", error);
      throw error;
    }
  },

  generateVideoToken: async (userId, roomId) => {
    try {
      const response = await api.get(
        `/generate_stream_video_token/${userId}/`,
        {
          params: { room_id: roomId },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error generating video token:", error);
      throw error;
    }
  },
};

export default streamService;
