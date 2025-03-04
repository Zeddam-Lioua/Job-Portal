import api from "./api";

const streamService = {
  generateToken: async (userId, roomId = null, guestInfo = null) => {
    try {
      const cleanUserId = userId.replace("@", "_").replace(".", "_");
      const endpoint = userId.startsWith("guest_")
        ? "generate_guest_token"
        : "generate_stream_token";

      console.log(
        `Generating token for user: ${cleanUserId}, room_id: ${roomId}`
      );

      // Check if the guest token has expired
      if (userId.startsWith("guest_")) {
        const guestTokenExpiry = localStorage.getItem("guestTokenExpiry");
        if (guestTokenExpiry && Date.now() > parseInt(guestTokenExpiry)) {
          console.warn("Guest token has expired, regenerating...");
        }
      }

      // Validate room ID for guests
      if (userId.startsWith("guest_") && !roomId) {
        throw new Error("Room ID is required for guest token generation.");
      }

      // Make the initial token request
      const response = await api.get(`/${endpoint}/${cleanUserId}/`, {
        params: roomId
          ? {
              room_id: roomId,
              user_name: guestInfo?.displayName || cleanUserId,
              role: userId.startsWith("guest_") ? "guest" : "admin",
            }
          : {},
      });

      // Store token expiry time for guests
      if (userId.startsWith("guest_")) {
        localStorage.setItem("guestTokenExpiry", Date.now() + 86400000); // 24 hours
      }

      return response.data;
    } catch (error) {
      // Handle specific cases where the token might have expired
      if (
        error.response?.status === 401 &&
        userId.startsWith("guest_") &&
        error.response?.data?.error?.includes("token expired")
      ) {
        console.warn("Token expired, attempting to regenerate...");

        // Regenerate the token
        const refreshResponse = await api.get(
          `/generate_guest_token/${cleanUserId}/`,
          {
            params: {
              room_id: roomId,
              user_name: guestInfo?.displayName || cleanUserId,
              role: "guest",
            },
          }
        );

        // Update the expiry time
        localStorage.setItem("guestTokenExpiry", Date.now() + 86400000);

        return refreshResponse.data;
      }

      console.error(
        "Error generating token:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default streamService;
