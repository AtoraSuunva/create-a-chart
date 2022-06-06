import { ChartCanvas } from './components/ChartCanvas'
import { ChartEntries } from './components/ChartEntries'
import { ChartSettings } from './components/ChartSettings'

export function App() {
  return (
    <>
      <ChartSettings />
      <ChartCanvas />
      <ChartEntries />
    </>
  )
}
