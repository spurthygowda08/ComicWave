import { useNavigate } from "react-router-dom";

interface Props {
  onLogout?: () => void;
}

export default function Index({ onLogout }: Props) {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h1>🎨 Comic Dashboard</h1>

      {/* 🎨 CREATE COMIC */}
      <button>
        Create New Comic
      </button>

      <br /><br />

      {/* 🔓 LOGOUT */}
      {onLogout && (
        <button onClick={onLogout}>
          Logout
        </button>
      )}
    </div>
  );
}