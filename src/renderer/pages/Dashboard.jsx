import ImageBrowser from "../components/ImageBrowser";
import Header from "../components/Header";
import FoldersTreeView from "../components/FoldersTreeView";
import Footer from "../components/Footer";
import DetailSidebar from "../components/DetailSidebar";
import styles from "./Dashboard.module.pcss";
import { showDetails } from "../states/showDetailsSignal";
import { Toaster } from "solid-toast";

const Dashboard = () => {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
        }}
      />
      <div class={styles.container}>
        <Header class={styles.header} />
        <div class={styles.content}>
          <FoldersTreeView class={styles.treeView} />
          <ImageBrowser class={styles.browser} />
          {showDetails() && <DetailSidebar class={styles.detail} />}
        </div>
        <Footer class={styles.footer} />
      </div>
    </>
  );
};

export default Dashboard;
