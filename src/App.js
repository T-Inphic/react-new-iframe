import React from "react";
import "./App.scss";
import { Button, DatePicker } from "antd";

function App() {
  return (
    <div className="App">
      <DatePicker />
      <Button type="primary">Primary</Button>
      {JSON.stringify(process.env)}
    </div>
  );
}

export default App;
