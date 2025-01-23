import axios from "axios";
import api from "./api";

const agoraService = {
  generateRtcToken: async (channelName) => {
    try {
      const response = await api.get(
        `/generate_agora_rtc_token/${channelName}/`
      );
      return response.data;
    } catch (error) {
      console.error("RTC Token Error:", error);
      throw error;
    }
  },
  generateRtmToken: async (userId) => {
    try {
      const response = await api.get(`/generate_agora_rtm_token/${userId}/`);
      return response.data;
    } catch (error) {
      console.error("RTM Token Error:", error);
      throw error;
    }
  },
};

export default agoraService;
