const axios = require('axios');

class ZoomService {
  constructor() {
    this.accountId = process.env.ZOOM_ACCOUNT_ID;
    this.clientId = process.env.ZOOM_CLIENT_ID;
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET;
    this.baseURL = 'https://api.zoom.us/v2';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get OAuth access token
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.accountId}`,
        {},
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Zoom OAuth error:', error.response?.data || error.message);
      throw new Error('Failed to get Zoom access token');
    }
  }

  // Create a scheduled Zoom meeting
  async createMeeting(options) {
    try {
      const token = await this.getAccessToken();

      const meetingData = {
        topic: options.topic || 'Class Session',
        type: 2, // Scheduled meeting
        start_time: options.startTime, // ISO 8601 format
        duration: options.duration || 60, // in minutes
        timezone: 'UTC',
        agenda: options.agenda || '',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
          audio: 'both',
          auto_recording: options.autoRecording || 'none', // 'cloud' for cloud recording
          allow_multiple_devices: true,
        },
        password: options.password || this.generatePassword()
      };

      const response = await axios.post(
        `${this.baseURL}/users/me/meetings`,
        meetingData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        meetingId: response.data.id,
        topic: response.data.topic,
        join_url: response.data.join_url,
        start_url: response.data.start_url,
        password: response.data.password,
        startTime: response.data.start_time,
        duration: response.data.duration,
        timezone: response.data.timezone
      };
    } catch (error) {
      console.error('Create Zoom meeting error:', error.response?.data || error.message);
      throw new Error('Failed to create Zoom meeting');
    }
  }

  // Get meeting details
  async getMeeting(meetingId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Get Zoom meeting error:', error.response?.data || error.message);
      throw new Error('Failed to get Zoom meeting details');
    }
  }

  // Update meeting
  async updateMeeting(meetingId, updates) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.patch(
        `${this.baseURL}/meetings/${meetingId}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Update Zoom meeting error:', error.response?.data || error.message);
      throw new Error('Failed to update Zoom meeting');
    }
  }

  // Delete meeting
  async deleteMeeting(meetingId) {
    try {
      const token = await this.getAccessToken();

      await axios.delete(
        `${this.baseURL}/meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Delete Zoom meeting error:', error.response?.data || error.message);
      throw new Error('Failed to delete Zoom meeting');
    }
  }

  // List recordings for a meeting
  async getRecordings(meetingId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/meetings/${meetingId}/recordings`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Get recordings error:', error.response?.data || error.message);
      return null;
    }
  }

  // Generate random meeting password
  generatePassword() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

module.exports = new ZoomService();
