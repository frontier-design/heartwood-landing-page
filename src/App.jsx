import GlobalStyle from './styles.js'
import GridOverlay from './components/GridOverlay.jsx'
import Loader from './components/Loader.jsx'
import ThemeColorSync from './components/ThemeColorSync.jsx'
import Home from './pages/Home/Home.jsx'

function App() {
  return (
    <>
      <GlobalStyle />
      <ThemeColorSync />
      {import.meta.env.DEV && <GridOverlay />}
      <Loader />
      <Home />
    </>
  )
}

export default App
