import { BrowserRouter, Route, Routes } from "react-router-dom";
import Auth from "./pages/Auth";
import Todo from "./pages/todo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/todos" element={<Todo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
