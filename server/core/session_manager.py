class SessionManager:
    def __init__(self):
        print("Initializing SessionManager")
        self.sessions = {}

    def create_session(self, session_id: str):
        self.sessions[session_id] = {}
        return self.sessions[session_id]

    def get_session(self, session_id: str):
        return self.sessions.get(session_id)

    def delete_session(self, session_id: str):
        if session_id in self.sessions:
            del self.sessions[session_id]

    def cleanup_expired_sessions(self):
        # simple placeholder
        print("Cleaning up sessions")