import { AppRouter } from './router';
import './App.css'; // This file now just has App layout styles

function App() {
  // The .App class (from App.css) is now the main container
  // for our entire router, which lives inside it.
  return (
    <div className="App">
      <AppRouter />
    </div>
  );
}

export default App;