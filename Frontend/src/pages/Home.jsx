export default function Home({ onLogout }) {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Welcome</h1>

      <button onClick={() => navigate("/dashboard")}>
        Create Comic
      </button>

      <button onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}