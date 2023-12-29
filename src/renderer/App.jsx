import Dashboard from "./pages/Dashboard";
import { Toaster } from "solid-toast";

function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
        }}
      />
      <Dashboard />
    </>
  );
}

export default App;
