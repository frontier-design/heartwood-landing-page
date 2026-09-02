import Navigation from '../../components/Navigation/Navigation.jsx'
import DeferredMount from '../../components/DeferredMount.jsx'
import Landing from './Components/Landing.jsx'
import Approach from './Components/Approach.jsx'
import Intelligence from './Components/Intelligence.jsx'
import Innovation from './Components/Innovation.jsx'
import Resilience from './Components/Resilience.jsx'
import Projects from './Components/Projects.jsx'
import Invest from './Components/Invest.jsx'
import Team from './Components/Team.jsx'
import FutureBuilt from './Components/FutureBuilt.jsx'
import Footer from './Components/Footer.jsx'

function Home() {
  return (
    <>
      <Navigation />
      <Landing />
      <Approach />
      {/* Everything below the first two screens mounts after the Loader reveals,
          so its imagery doesn't compete with the hero during the initial load. */}
      <DeferredMount>
        <Intelligence />
        <Innovation />
        <Resilience />
        <Projects />
        <Invest />
        <FutureBuilt />
        <Team />
        <Footer />
      </DeferredMount>
    </>
  )
}

export default Home
