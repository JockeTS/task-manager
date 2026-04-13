import Footer from "./Footer";
import Header from "./Header";

const PageLayout = ({ children }) => {
  return (
    <div>
      <Header />

      <main className="mx-auto max-w-4xl px-4 space-y-8 py-12">{children}</main>

      <Footer />
    </div>
  );
};

export default PageLayout;