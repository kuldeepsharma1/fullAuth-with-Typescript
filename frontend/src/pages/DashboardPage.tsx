import { useAuthStore } from "@/store/authStore";

const DashboardPage: React.FC = () => {
  const { user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Error: User data is not available</div>;
  }

  return (
    <div>
      <h1>Dashboard Page</h1>
      <p>Welcome, {user.username}!</p>
      <p>Your email is {user.email}!</p>
    </div>
  );
};

export default DashboardPage;
