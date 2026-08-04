import { useState } from 'react'
import { TitleBar, UpdateBanner } from '@renderer/ui'
import { Home } from '@renderer/pages/Home'
import { WizardShell } from '@renderer/wizard/WizardShell'

type View = 'home' | 'wizard'

function App() {
  const [view, setView] = useState<View>('home')

  return (
    <div className="flex h-screen flex-col">
      <TitleBar />
      <UpdateBanner />
      {view === 'home' ? (
        <Home onStartWizard={() => setView('wizard')} />
      ) : (
        <WizardShell onExit={() => setView('home')} />
      )}
    </div>
  )
}

export default App
