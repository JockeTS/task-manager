import Footer from "./Footer";
import Header from "./Header";

const PageLayout = ({ user, children, onLogout }) => {
  return (
    <div className="max-w-2xl mx-auto bg-card rounded-2xl my-6">
      <Header user={user} onLogout={onLogout} />

      <main className="px-4 space-y-8 py-12">{children}</main>

      <Footer />
    </div>
  );
};

export default PageLayout;