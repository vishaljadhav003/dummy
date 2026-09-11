import Maintenance from "./Maintenance";
// document.addEventListener("keydown", (e) => {
//   // F12
//   if (e.key === "F12") {
//     e.preventDefault();
//   }

//   // Ctrl + Shift + I / J / C
//   if (
//     e.ctrlKey &&
//     e.shiftKey &&
//     ["I", "J", "C"].includes(e.key.toUpperCase())
//   ) {
//     e.preventDefault();
//   }

//   // Ctrl + U
//   if (e.ctrlKey && e.key.toUpperCase() === "U") {
//     e.preventDefault();
//   }
// });

// document.addEventListener("contextmenu", (e) => {
//   e.preventDefault();
// });
function App() {
  return <Maintenance />;
  
}

export default App;