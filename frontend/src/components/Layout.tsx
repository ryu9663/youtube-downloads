import React from "react";
import { Outlet } from "react-router";
import Header from "./Header";
import Footer from "./Footer";

const Layout: React.FC = () => {
  return (
    <div className="bg-gray-100">
      <Header />

      <main className="container mx-auto">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
