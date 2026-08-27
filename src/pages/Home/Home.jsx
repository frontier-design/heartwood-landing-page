import Navigation from '../../components/Navigation/Navigation.jsx'
import Landing from './Components/Landing.jsx'
import Intro from './Components/Intro.jsx'
import Approach from './Components/Approach.jsx'
import Development from './Components/Development.jsx'
import Pillars from './Components/Pillars.jsx'
import Resilience from './Components/Resilience.jsx'
import Projects from './Components/Projects.jsx'
import Performance from './Components/Performance.jsx'
import FutureBuilt from './Components/FutureBuilt.jsx'
import Footer from './Components/Footer.jsx'

function Home() {
  return (
    <>
      <Navigation />
      <Landing />
      <Intro />
      <Approach />
      <Development />
      <Pillars />
      <Resilience />
      <Projects />
      <Performance />
      <FutureBuilt />
      <Footer />
    </>
  )
}

export default Home
