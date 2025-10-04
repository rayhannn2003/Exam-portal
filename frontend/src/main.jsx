import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // ✅ important
import base64Icon from './base64Code.txt?raw';

// dynamically set favicon with multiple sizes
const favicon16 = document.createElement('link');
favicon16.rel = 'icon';
favicon16.type = 'image/png';
favicon16.sizes = '16x16';
favicon16.href = base64Icon;
document.head.appendChild(favicon16);

const favicon32 = document.createElement('link');
favicon32.rel = 'icon';
favicon32.type = 'image/png';
favicon32.sizes = '32x32';
favicon32.href = base64Icon;
document.head.appendChild(favicon32);

const favicon64 = document.createElement('link');
favicon64.rel = 'icon';
favicon64.type = 'image/png';
favicon64.sizes = '64x64';
favicon64.href = base64Icon;
document.head.appendChild(favicon64);

// Apple touch icon for better mobile display
const appleTouchIcon = document.createElement('link');
appleTouchIcon.rel = 'apple-touch-icon';
appleTouchIcon.sizes = '180x180';
appleTouchIcon.href = base64Icon;
document.head.appendChild(appleTouchIcon);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
