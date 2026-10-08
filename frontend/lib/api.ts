const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("telugu_token") || localStorage.getItem("mbg_token");
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(err.message || "Request failed");
    }
    return res.json();
  }

  // Auth
  getDiscordLoginUrl() { return `${this.baseUrl}/auth/discord`; }
  async devLogin(role: string = "player", username?: string) {
    const res: any = await this.request("/auth/dev-login", {
      method: "POST",
      body: JSON.stringify({ role, username }),
    });
    if (res?.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }
  async loginMobile(phone: string, password?: string) {
    const res: any = await this.request("/auth/login-mobile", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    });
    if (res?.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }
  async register(data: {
    discordUsername: string;
    role?: string;
    fullName?: string;
    freefireUid?: string;
    phone?: string;
    password?: string;
    age?: number;
  }) {
    const res: any = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res?.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }
  async getMe() { return this.request("/auth/me"); }
  async completeOnboarding(data: any) { return this.request("/auth/onboarding", { method: "POST", body: JSON.stringify(data) }); }

  // Tournaments
  async getTournaments(status?: string) { return this.request(`/tournaments${status ? `?status=${status}` : ""}`); }
  async getTournament(id: string) { return this.request(`/tournaments/${id}`); }
  async registerForTournament(id: string, metadata?: any) { return this.request(`/tournaments/${id}/register`, { method: "POST", body: JSON.stringify({ metadata }) }); }
  async getMyRegistrations() { return this.request("/tournaments/mine/registrations"); }
  async getRegistrations(id: string) { return this.request(`/tournaments/${id}/registrations`); }
  async updateRegistrationStatus(id: string, regId: string, status: string) {
    return this.request(`/tournaments/${id}/registrations/${regId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }
  async confirmAllRegistrations(id: string) {
    return this.request(`/tournaments/${id}/registrations/confirm-all`, {
      method: "POST",
    });
  }
  async createTournament(data: {
    name: string;
    format?: string;
    prizePool?: number;
    entryFee?: number;
    maxTeams?: number;
    description?: string;
    bannerUrl?: string;
  }) {
    return this.request("/tournaments", { method: "POST", body: JSON.stringify(data) });
  }
  async updateTournament(id: string, data: any) {
    return this.request(`/tournaments/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  }
  async updateTournamentStatus(id: string, status: string) {
    return this.request(`/tournaments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
  }

  // Teams
  async createTeam(data: any) { return this.request("/teams", { method: "POST", body: JSON.stringify(data) }); }
  async getMyTeam() { return this.request("/teams/mine"); }
  async joinTeam(inviteCode: string) { return this.request(`/teams/join/${inviteCode}`, { method: "POST" }); }
  async getTeam(id: string) { return this.request(`/teams/${id}`); }
  async vouchMember(teamId: string, memberId: string) { return this.request(`/teams/${teamId}/vouch/${memberId}`, { method: "POST" }); }
  async removeMember(teamId: string, memberId: string) { return this.request(`/teams/${teamId}/members/${memberId}`, { method: "DELETE" }); }

  // Verification
  async getVerificationStatus() { return this.request("/verification/status"); }
  async initiateFF() { return this.request("/verification/freefire/initiate", { method: "POST" }); }
  async submitFFScreenshot(screenshotUrl: string) {
    return this.request("/verification/freefire/screenshot", { method: "POST", body: JSON.stringify({ screenshotUrl }) });
  }
  async uploadFile(file: File, folder: "screenshot" | "logo" = "screenshot"): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const token = this.getToken();
    const res = await fetch(`${this.baseUrl}/uploads/${folder}`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(err.message || "Upload failed");
    }
    return res.json();
  }
  async sendOtp(phone: string) { return this.request("/verification/otp/send", { method: "POST", body: JSON.stringify({ phone }) }); }
  async verifyOtp(phone: string, otp: string) { return this.request("/verification/otp/verify", { method: "POST", body: JSON.stringify({ phone, otp }) }); }
  async submitAppeal(note: string) { return this.request("/verification/appeal", { method: "POST", body: JSON.stringify({ note }) }); }
  async submitDigilocker(digilockerUrl: string) { return this.request("/verification/digilocker", { method: "POST", body: JSON.stringify({ digilockerUrl }) }); }
  async getDigilockerPending() { return this.request("/verification/admin/digilocker/pending"); }
  async verifyDigilocker(id: string) { return this.request(`/verification/admin/digilocker/${id}/verify`, { method: "PATCH" }); }
  async getVerificationConfig() { return this.request("/verification/admin/config"); }
  async updateVerificationConfig(data: { autoApproveMin?: number; manualReviewMin?: number }) {
    return this.request("/verification/admin/config", { method: "PATCH", body: JSON.stringify(data) });
  }

  // Leaderboard
  async getLeaderboard(tournamentId: string, stageId?: string) {
    return this.request(`/leaderboard/tournament/${tournamentId}${stageId ? `?stageId=${stageId}` : ""}`);
  }
  async getGlobalTeamRankings(limit = 50) {
    return this.request(`/leaderboard/global/teams?limit=${limit}`);
  }
  async getRecentWinners(limit = 5) {
    return this.request(`/leaderboard/recent-winners?limit=${limit}`);
  }
  async getPublicStats() {
    return this.request("/tournaments/stats/overview");
  }
  async exportLeaderboardCsv(tournamentId: string, stageId?: string): Promise<Blob> {
    const token = this.getToken();
    const res = await fetch(
      `${this.baseUrl}/leaderboard/tournament/${tournamentId}/export${stageId ? `?stageId=${stageId}` : ""}`,
      { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } },
    );
    if (!res.ok) throw new Error("Failed to export leaderboard CSV");
    return res.blob();
  }

  // Notifications
  async getNotifications() { return this.request("/notifications"); }
  async getUnreadCount() { return this.request("/notifications/unread-count"); }
  async markRead(id: string) { return this.request(`/notifications/${id}/read`, { method: "PATCH" }); }
  async markAllRead() { return this.request("/notifications/mark-all-read", { method: "POST" }); }
  async getNotifPrefs() { return this.request("/notifications/prefs"); }
  async updateNotifPrefs(data: any) { return this.request("/notifications/prefs", { method: "PATCH", body: JSON.stringify(data) }); }

  // Disputes
  async raiseDispute(data: any) { return this.request("/disputes", { method: "POST", body: JSON.stringify(data) }); }
  async getMyDisputes() { return this.request("/disputes/mine"); }
  async getDisputesQueue(status?: string) { return this.request(`/disputes/queue${status ? `?status=${status}` : ""}`); }

  // Payouts
  async getMyPayouts() { return this.request("/payouts/mine"); }
  async getTournamentPayouts(tournamentId: string) { return this.request(`/payouts/tournament/${tournamentId}`); }
  async updatePayoutStatus(payoutId: string, status: string, txRef?: string) {
    return this.request(`/payouts/${payoutId}/status`, { method: "PATCH", body: JSON.stringify({ status, txRef }) });
  }
  async finalizeTournamentPayouts(tournamentId: string) { return this.request(`/payouts/tournament/${tournamentId}/finalize`, { method: "POST" }); }

  // Rooms
  async getNextMatch() { return this.request("/rooms/next-match"); }
  async getMyNextMatch() { return this.getNextMatch(); }
  async checkInSquad() { return this.request("/rooms/check-in", { method: "POST" }); }
  async updateRoom(roomId: string, data: { scheduledAt?: string; map?: string; roomCode?: string; password?: string; releaseMinutes?: number }) {
    return this.request(`/rooms/${roomId}`, { method: "PATCH", body: JSON.stringify(data) });
  }
  async updateRoomSchedule(roomId: string, scheduledAt: string, map?: string, roomCode?: string, password?: string) {
    return this.request(`/rooms/${roomId}`, { method: "PATCH", body: JSON.stringify({ scheduledAt, map, roomCode, password }) });
  }

  // Matches (Module I)
  async getGroupMatches(groupId: string) {
    return this.request(`/matches/group/${groupId}`);
  }
  async flagMatchResultDisputed(resultId: string) {
    return this.request(`/matches/results/${resultId}/flag`, { method: "PATCH" });
  }
  async getAllMatches() {
    return this.request("/matches/admin/all");
  }
  async submitMatchResults(matchId: string, results: { teamId: string; placement: number; kills: number; evidenceUrl?: string }[]) {
    return this.request(`/matches/${matchId}/results`, { method: "POST", body: JSON.stringify({ results }) });
  }
  async finalizeMatchResult(resultId: string) {
    return this.request(`/matches/results/${resultId}/finalize`, { method: "PATCH" });
  }

  // Announcements (Module M)
  async getAnnouncements(tournamentId?: string) {
    return this.request(`/announcements${tournamentId ? `?tournamentId=${tournamentId}` : ""}`);
  }
  async createAnnouncement(data: { title: string; body: string; tournamentId?: string }) {
    return this.request("/announcements", { method: "POST", body: JSON.stringify(data) });
  }

  // Admin
  async getAdminDashboard() { return this.request("/admin/dashboard"); }
  async getAdminPlayers() { return this.request("/admin/players"); }
  async updatePlayerRole(id: string, role: string) { return this.request(`/admin/players/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }); }
  async getPendingVerifications() { return this.request("/verification/admin/pending"); }
  async approveVerification(id: string) {
    return this.request(`/admin/verifications/${id}/approve`, { method: "PATCH" })
      .catch(() => this.request(`/verification/admin/approve/${id}`, { method: "PATCH" }));
  }
  async rejectVerification(id: string) {
    return this.request(`/admin/verifications/${id}/reject`, { method: "PATCH" })
      .catch(() => this.request(`/verification/admin/reject/${id}`, { method: "PATCH" }));
  }
  async getAuditLogs() { return this.request("/admin/audit-logs"); }
  async seedGroups(tournamentId: string, stageId: string, groupCount: number = 4) {
    return this.request("/admin/seed-groups", { method: "PATCH", body: JSON.stringify({ tournamentId, stageId, groupCount }) });
  }
  async batchRooms(stageId: string, scheduledAt?: string, releaseMinutes: number = 15) {
    return this.request("/admin/batch-rooms", { method: "PATCH", body: JSON.stringify({ stageId, scheduledAt, releaseMinutes }) });
  }
  async resolveDispute(id: string, resolution: string, status: "resolved_upheld" | "resolved_rejected") {
    return this.request(`/admin/disputes/${id}/resolve`, { method: "PATCH", body: JSON.stringify({ resolution, status }) });
  }


  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("telugu_token", token);
      localStorage.setItem("mbg_token", token);
    }
  }
  clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("telugu_token");
      localStorage.removeItem("mbg_token");
    }
  }
}

export const api = new ApiClient(API_URL);
