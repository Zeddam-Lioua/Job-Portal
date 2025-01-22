import axios from "axios";
import api from "./api";

const agoraService = {
  generateToken: async (channelName) => {
    try {
      const response = await api.get(`/generate_agora_token/${channelName}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default agoraService;
