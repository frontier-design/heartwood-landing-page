import GlobalStyle from './styles.js'
import GridOverlay from './components/GridOverlay.jsx'
import Home from './pages/Home/Home.jsx'

function App() {
  return (
    <>
      <GlobalStyle />
      {import.meta.env.DEV && <GridOverlay />}
      <Home />
    </>
  )
}

export default App
