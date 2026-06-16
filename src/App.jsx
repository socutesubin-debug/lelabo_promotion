import { useState } from 'react'
import './App.css'

import IntroScreen from './IntroScreen'
import SensoryGuideScreen from './SensoryGuideScreen'
import MaterialPlaceScreen from './MaterialPlaceScreen'
import SelectedMaterialsScreen from './SelectedMaterialsScreen'
import BlendingVortexScreen from './BlendingVortexScreen'
import MixingProcessScreen from './MixingProcessScreen'
import FinalScentScreen from './FinalScentScreen'
import LabelTypingScreen from './LabelTypingScreen'
import LabelingPackagingScreen from './LabelingPackagingScreen'
import ClosingScreen from './ClosingScreen'
import { startBackgroundMusic, toggleMute, isMuted, playClick } from './utils/soundManager'

function App() {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [muted, setMuted] = useState(isMuted())

  const goNext = () => {
    playClick()
    setCurrentScreen((prev) => Math.min(prev + 1, screens.length - 1))
  }

  const handleMuteToggle = (e) => {
    e.stopPropagation()
    setMuted(toggleMute())
  }

  const screens = [
    <IntroScreen onNext={goNext} />,
    <SensoryGuideScreen onNext={goNext} />,
    <MaterialPlaceScreen onNext={goNext} />,
    <SelectedMaterialsScreen onNext={goNext} />,
    <BlendingVortexScreen onNext={goNext} />,
    <MixingProcessScreen onNext={goNext} />,
    <FinalScentScreen onNext={goNext} />,
    <LabelTypingScreen onNext={goNext} />,
    <LabelingPackagingScreen onNext={goNext} />,
    <ClosingScreen onNext={goNext} />,
  ]

  return (
    <main className="app" onClick={startBackgroundMusic}>
      <button className="audio-mute-btn" onClick={handleMuteToggle}>
        {muted ? 'SOUND OFF' : 'SOUND ON'}
      </button>
      {screens[currentScreen]}
    </main>
  )
}

export default App
