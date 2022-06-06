import { useState } from 'preact/hooks'
import create from 'zustand'

interface ChartSettings {
  topLabel: string
  rightLabel: string
  bottomLabel: string
  leftLabel: string
  labelSize: number
  entryNameSize: number
  chartSize: number
  gridSize: number
  arrowSize: number
  chartColor: string
  axisColor: string
  gridColor: string
}

type KeysOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: any
}

type StringChartSetting = KeysOfType<ChartSettings, string>
type NumberChartSetting = KeysOfType<ChartSettings, number>

interface ChartSettingsStore extends ChartSettings {
  updateSettings: (settings: Partial<ChartSettings>) => void
}

export const useChartSettingsStore = create<ChartSettingsStore>((set) => ({
  topLabel: 'Y Axis',
  rightLabel: 'X Axis',
  bottomLabel: '',
  leftLabel: '',
  labelSize: 24,
  entryNameSize: 18,
  chartSize: 1000,
  gridSize: 50,
  arrowSize: 10,
  chartColor: '#ffffff',
  axisColor: '#000000',
  gridColor: '#eeeeee',
  updateSettings: (settings) =>
    set((state) => ({
      ...state,
      ...settings,
    })),
}))

export function ChartSettings() {
  const {
    rightLabel,
    topLabel,
    bottomLabel,
    leftLabel,
    labelSize,
    entryNameSize,
    chartSize,
    gridSize,
    arrowSize,
    chartColor,
    axisColor,
    gridColor,
    updateSettings,
  } = useChartSettingsStore()

  const [hidden, setHidden] = useState(false)

  const updateSetting = (setting: StringChartSetting) => {
    return (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
      updateSettings({ [setting]: e.currentTarget.value })
    }
  }

  const updateNumericalSetting = (
    setting: NumberChartSetting,
    range: Partial<Range> = {},
  ) => {
    return (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
      const num: number = parseInt(e.currentTarget.value, 10)
      if (!Number.isNaN(num) && inRange(num, range)) {
        updateSettings({ [setting]: num })
      }
    }
  }

  return (
    <aside class={`sidebar left ${hidden ? 'hidden' : 'visible'}`}>
      <div class="container">
        <h1>Chart Settings</h1>

        <div class="input-list">
          <label for="top-label">Top Label</label>
          <input
            type="text"
            id="top-label"
            value={topLabel}
            onInput={updateSetting('topLabel')}
          />

          <label for="right-label">Right Label</label>
          <input
            type="text"
            id="right-label"
            value={rightLabel}
            onInput={updateSetting('rightLabel')}
          />

          <label for="bottom-label">Bottom Label</label>
          <input
            type="text"
            id="bottom-label"
            value={bottomLabel}
            onInput={updateSetting('bottomLabel')}
          />

          <label for="left-label">Left Label</label>
          <input
            type="text"
            id="left-label"
            value={leftLabel}
            onInput={updateSetting('leftLabel')}
          />

          <hr />

          <label for="label-size">Label Size</label>
          <input
            type="number"
            id="label-size"
            min={10}
            value={labelSize}
            onInput={updateNumericalSetting('labelSize', { min: 10 })}
          />

          <label for="entry-name-size">Entry Name Size</label>
          <input
            type="number"
            id="entry-name-size"
            min={10}
            value={entryNameSize}
            onInput={updateNumericalSetting('entryNameSize', { min: 10 })}
          />

          <label for="chart-size">Chart Size</label>
          <input
            type="number"
            id="chart-size"
            min={10}
            value={chartSize}
            onInput={updateNumericalSetting('chartSize', { min: 10 })}
          />

          <label for="grid-size">Grid Size</label>
          <input
            type="number"
            id="grid-size"
            min={0}
            value={gridSize}
            onInput={updateNumericalSetting('gridSize', { min: 0 })}
          />

          <label for="arrow-size">Arrow Size</label>
          <input
            type="number"
            id="arrow-size"
            value={arrowSize}
            onInput={updateNumericalSetting('arrowSize')}
          />

          <hr />

          <label for="chart-color">Chart Background Color</label>
          <input
            type="color"
            id="chart-color"
            value={chartColor}
            onInput={updateSetting('chartColor')}
          />

          <label for="axis-color">Axis Color</label>
          <input
            type="color"
            id="axis-color"
            value={axisColor}
            onInput={updateSetting('axisColor')}
          />

          <label for="axis-color">Grid Color</label>
          <input
            type="color"
            id="axis-color"
            value={gridColor}
            onInput={updateSetting('gridColor')}
          />
        </div>

        <hr />

        <div>
          <p>Want to save the chart? Right click and save image!</p>
          <p class="credits">
            Website by <a href="https://giraffeduck.com">Atora</a>
          </p>
          <p class="credits">
            <a href="https://github.com/AtoraSuunva/create-a-chart">
              Source (GitHub)
            </a>
          </p>
          <p class="credits">
            This is build {import.meta.env.CF_PAGES_BRANCH}/
            {import.meta.env.CF_PAGES_COMMIT_SHA}
          </p>
        </div>
      </div>
      <button class="expand-button" onClick={() => setHidden((prev) => !prev)}>
        {hidden ? '▶' : ' ◀'}
      </button>
    </aside>
  )
}

interface Range {
  min: number
  max: number
}

function inRange(value: number, range: Partial<Range>): boolean {
  if (range.min !== undefined && value < range.min) {
    return false
  }
  if (range.max !== undefined && value > range.max) {
    return false
  }
  return true
}
