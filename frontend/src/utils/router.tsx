import { createBrowserRouter } from "react-router";
import Layout from "../components/Layout";
import HomePage from "../pages/HomePage";
import DownloadPage from "../pages/DownloadPage";
import CompletePage from "../pages/CompletePage";
import PaymentPage from "../pages/PaymentPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "download",
        element: <DownloadPage />,
      },
      {
        path: "complete",
        element: <CompletePage />,
      },
      {
        path: "payment",
        element: <PaymentPage />,
      },
    ],
  },
]);