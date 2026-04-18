import { Button } from "./ui/button";

const Header = ({ user, onLogout }) => {
  return (
    <header className="border-b py-12 px-4 bg-card/50 backdrop-blur">
      <h1 className="text-2xl font-bold text-center mb-4">Recurso - Task Manager</h1>

      {user &&
        <div className="flex gap-2 items-center justify-center w-full text-sm">
          <p>Logged in as: <strong>{user.email}</strong></p>

          <Button onClick={onLogout}>
            Logout
          </Button>
        </div>
      }
    </header>
  );
};

export default Header;