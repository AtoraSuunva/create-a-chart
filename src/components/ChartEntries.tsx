import { Point } from './ChartCanvas'
import create from 'zustand'
import { randomHexColor } from '../utils'
import { useState } from 'preact/hooks'

export interface ChartEntry {
  id: number
  name: string
  color: string
  coords: Point
}

type ChartEntryAdd = Omit<ChartEntry, 'id'>
type ChartEntryUpdate = Partial<ChartEntry> & Pick<ChartEntry, 'id'>

interface EntryStore {
  currentId: number
  entries: ChartEntry[]
  addEntry: (entry: ChartEntryAdd) => void
  updateEntry: (entry: ChartEntryUpdate) => void
  removeEntry: (id: number) => void
}

export const useEntryStore = create<EntryStore>((set) => ({
  currentId: 0,
  entries: [],
  addEntry: (entry) =>
    set((state) => ({
      currentId: state.currentId + 1,
      entries: [...state.entries, { ...entry, id: state.currentId + 1 }],
    })),

  updateEntry: (entry) =>
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id !== entry.id ? e : { ...e, ...entry },
      ),
    })),

  removeEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    })),
}))

const DEFAULT_ENTRY: ChartEntryAdd = {
  name: '',
  color: '#000000',
  coords: { x: 0, y: 0 },
}

function makeNewEntry(): ChartEntryAdd {
  const newEntry = Object.assign({}, DEFAULT_ENTRY)
  newEntry.color = randomHexColor()
  return newEntry
}

export function ChartEntries() {
  const entries = useEntryStore((state) => state.entries)
  const addEntry = useEntryStore((state) => state.addEntry)
  const [hidden, setHidden] = useState(false)

  const entryComponents = entries.map(ChartEntry)

  const addNewEntry = () => addEntry(makeNewEntry())

  return (
    <aside class={`sidebar right ${hidden ? 'hidden' : 'visible'}`}>
      <button class="expand-button" onClick={() => setHidden((prev) => !prev)}>
        {hidden ? '◀' : '▶'}
      </button>
      <div class="container">
        <h1>Chart Entries</h1>
        <button id="add-entry" onClick={addNewEntry}>
          Add entry
        </button>
        <div class="entry-list">{entryComponents}</div>
      </div>
    </aside>
  )
}

function ChartEntry({ id, name, color, coords }: ChartEntry) {
  const updateEntry = useEntryStore((state) => state.updateEntry)
  const removeEntry = useEntryStore((state) => state.removeEntry)

  const updateName = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    updateEntry({ id, name: e.currentTarget.value })
  }
  const updateColor = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    updateEntry({ id, color: e.currentTarget.value })
  }
  const remove = () => removeEntry(id)

  return (
    <div class="entry">
      <div class="entry-buttons">
        <input
          class="entry-color"
          type="color"
          value={color}
          onInput={updateColor}
        />
        <button class="entry-remove" onClick={remove}>
          ✖
        </button>
      </div>
      <div class="entry-details">
        <input
          class="entry-name"
          type="text"
          placeholder="Name"
          value={name}
          onInput={updateName}
        />
        <span class="entry-coords">
          ID: {id} X: {Math.floor(coords.x)}, Y: {Math.floor(coords.y)}
        </span>
      </div>
    </div>
  )
}
