import { HashRouter, Route } from "@solidjs/router";
import { lazy } from "solid-js";

const Settings = lazy(() => import("./pages/Settings"));
const About = lazy(() => import("./pages/About"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function App() {
  return (
    <HashRouter>
      <Route path="/settings" component={Settings} />
      <Route path="/about" component={About} />
      <Route path="/" component={Dashboard} />
    </HashRouter>
  );
}

export default App;
