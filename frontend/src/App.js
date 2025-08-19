import { useEffect, useState } from "react";

function App() {
  const [advice, setAdvice] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/ai/coach/")
      .then(res => res.json())
      .then(data => setAdvice(data.advice));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>FinRight AI - Your Smart Money Coach 💡</h1>
      <p><strong>Personalized Advice:</strong></p>
      <p>{advice}</p>
    </div>
  );
}

export default App;
