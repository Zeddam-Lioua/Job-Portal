import api from "./api";

const streamService = {
  generateToken: async (userId, roomId = null) => {
    try {
      const cleanUserId = userId.replace("@", "_").replace(".", "_");
      const response = await api.get(`/generate_stream_token/${cleanUserId}/`, {
        params: roomId ? { room_id: roomId } : {},
      });
      return response.data;
    } catch (error) {
      console.error("Error generating token:", error);
      throw error;
    }
  },
};

export default streamService;
