import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import FeedbackModal from '../components/FeedbackModal'

const ANIMAL_TYPES = ['птица', 'бозайник', 'влечуго', 'риба', 'земноводно']
const DIETS        = ['месояден', 'тревопасен', 'всеяден']
const POI_CAT_LABELS = {
  food: 'Хранене', attraction: 'Атракция', medical: 'Медицински',
  ticket: 'Каса', shop: 'Магазин', wc: 'Тоалетна',
  parking: 'Паркинг', bus_stop: 'Спирка',
}

const EMPTY_ANIMAL = { nameBg: '', nameEn: '', species: '', animalType: 'бозайник', diet: 'всеяден', lat: '', lng: '' }
const EMPTY_POI    = { nameBg: '', category: 'food', lat: '', lng: '' }

function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-xs font-semibold text-zoo-brown uppercase tracking-wide">{label}</label>
      <input
        {...props}
        className="mt-1 w-full rounded-xl border border-[--color-border] bg-[--color-bg-base] px-3 py-2 text-sm text-[--color-text-main] outline-none focus:border-zoo-green transition-colors"
      />
    </div>
  )
}

function Select({ label, options, ...props }) {
  return (
    <div>
      <label className="text-xs font-semibold text-zoo-brown uppercase tracking-wide">{label}</label>
      <select
        {...props}
        className="mt-1 w-full rounded-xl border border-[--color-border] bg-[--color-bg-base] px-3 py-2 text-sm text-[--color-text-main] outline-none focus:border-zoo-green transition-colors"
      >
        {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
      </select>
    </div>
  )
}

function CoordFields({ lat, lng, onLatChange, onLngChange }) {
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError,   setGpsError]   = useState(null)

  function fillGPS() {
    if (!navigator.geolocation) { setGpsError('Геолокацията не се поддържа'); return }
    setGpsLoading(true)
    setGpsError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        onLatChange(pos.coords.latitude.toFixed(7))
        onLngChange(pos.coords.longitude.toFixed(7))
        setGpsLoading(false)
      },
      () => { setGpsError('Неуспешно получаване на позиция'); setGpsLoading(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zoo-brown uppercase tracking-wide">Координати *</label>
        <button
          type="button"
          onClick={fillGPS}
          disabled={gpsLoading}
          className="text-xs font-semibold text-zoo-green flex items-center gap-1 disabled:opacity-50"
        >
          {gpsLoading ? '⏳ Зарежда…' : '📍 Текуща позиция'}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number" step="any" placeholder="42.6583 (lat)"
          value={lat}
          onChange={e => onLatChange(e.target.value)}
          className="w-full rounded-xl border border-[--color-border] bg-[--color-bg-base] px-3 py-2 text-sm text-[--color-text-main] outline-none focus:border-zoo-green transition-colors"
        />
        <input
          type="number" step="any" placeholder="23.3311 (lng)"
          value={lng}
          onChange={e => onLngChange(e.target.value)}
          className="w-full rounded-xl border border-[--color-border] bg-[--color-bg-base] px-3 py-2 text-sm text-[--color-text-main] outline-none focus:border-zoo-green transition-colors"
        />
      </div>
      {gpsError && <p className="text-xs text-red-500">{gpsError}</p>}
    </div>
  )
}

function AddForm({ title, children, onSubmit, onClose }) {
  return (
    <div className="mt-2 bg-[--color-bg-card] rounded-2xl border border-[--color-border] p-4 space-y-3">
      <h3 className="font-bold text-zoo-green">{title}</h3>
      {children}
      <div className="flex gap-2 pt-1">
        <button onClick={onSubmit} className="flex-1 bg-zoo-primary text-white rounded-xl py-2 text-sm font-semibold">
          Запази
        </button>
        <button onClick={onClose} className="flex-1 border border-[--color-border] rounded-xl py-2 text-sm text-zoo-brown">
          Откажи
        </button>
      </div>
    </div>
  )
}

function SectionButton({ open, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-[--color-bg-card] border border-[--color-border] rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[--color-text-main] flex justify-between items-center"
    >
      {children}
      <span className="text-zoo-brown opacity-50">{open ? '▲' : '▼'}</span>
    </button>
  )
}

export default function SettingsPage() {
  const {
    darkMode, setDarkMode, addAnimal, addPoi, exportAnimalsJSON, allAnimals, visited,
    isLinked, userEmail, syncStatus, saveProgress,
  } = useData()
  const seenCount = Object.keys(visited).length

  const [progressEmail,  setProgressEmail]  = useState('')
  const [progressStatus, setProgressStatus] = useState('idle') // idle | sending | sent | error

  async function handleSaveProgress(e) {
    e.preventDefault()
    if (!progressEmail) return
    setProgressStatus('sending')
    try {
      await saveProgress(progressEmail)
      setProgressStatus('sent')
    } catch {
      setProgressStatus('error')
    }
  }

  const [openForm,      setOpenForm]      = useState(null)
  const [animalForm,    setAnimalForm]    = useState(EMPTY_ANIMAL)
  const [poiForm,       setPoiForm]       = useState(EMPTY_POI)
  const [saved,         setSaved]         = useState(null)
  const [exported,      setExported]      = useState(false)
  const [feedbackOpen,  setFeedbackOpen]  = useState(false)
  const [betaTaps,      setBetaTaps]      = useState(0)
  const [adminUnlocked, setAdminUnlocked] = useState(false)

  function handleBetaTap() {
    const next = betaTaps + 1
    setBetaTaps(next)
    if (next >= 2) {
      setAdminUnlocked(true)
      flash('🔓 Админ режим')
    }
  }

  function flash(msg) { setSaved(msg); setTimeout(() => setSaved(null), 2500) }

  function toggleForm(name) {
    setOpenForm(f => f === name ? null : name)
  }

  function openPoiForm(formName, defaultCat) {
    setPoiForm({ ...EMPTY_POI, category: defaultCat })
    setOpenForm(formName)
  }

  function handleAddAnimal() {
    if (!animalForm.nameBg || !animalForm.lat || !animalForm.lng) return
    addAnimal(animalForm)
    setAnimalForm(EMPTY_ANIMAL)
    setOpenForm(null)
    flash('Животното е добавено!')
  }

  function handleAddPoi() {
    if (!poiForm.nameBg || !poiForm.lat || !poiForm.lng) return
    addPoi(poiForm)
    setPoiForm(EMPTY_POI)
    setOpenForm(null)
    flash('Обектът е добавен!')
  }

  function handleExport() {
    navigator.clipboard.writeText(exportAnimalsJSON()).then(() => {
      setExported(true)
      setTimeout(() => setExported(false), 2500)
    })
  }

  return (
    <div className="flex flex-col pb-8">
      <div className="bg-zoo-primary px-4 pt-10 pb-5">
        <h1 className="text-xl font-bold text-white">Настройки</h1>
      </div>
      <div className="p-4 space-y-6">

      {/* Dark mode */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zoo-brown mb-3">Изглед</h2>
        <div className="bg-[--color-bg-card] rounded-2xl border border-[--color-border] px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-[--color-text-main]">🌙 Тъмен режим</span>
          <button
            onClick={() => setDarkMode(d => !d)}
            className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-zoo-green' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </section>

      {/* Admin: Add data + Export — hidden until BETA tapped twice */}
      {adminUnlocked && <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zoo-brown mb-3">Добави</h2>
        <div className="space-y-2">

          {/* Add animal */}
          <SectionButton open={openForm === 'animal'} onClick={() => toggleForm('animal')}>
            🦁 Добави животно
          </SectionButton>
          {openForm === 'animal' && (
            <AddForm title="Ново животно" onSubmit={handleAddAnimal} onClose={() => setOpenForm(null)}>
              <Field label="Име (БГ) *" value={animalForm.nameBg}
                onChange={e => setAnimalForm(p => ({ ...p, nameBg: e.target.value }))} placeholder="Чакал" />
              <Field label="Име (EN)" value={animalForm.nameEn}
                onChange={e => setAnimalForm(p => ({ ...p, nameEn: e.target.value }))} placeholder="Jackal" />
              <Field label="Вид (латински)" value={animalForm.species}
                onChange={e => setAnimalForm(p => ({ ...p, species: e.target.value }))} placeholder="Canis aureus" />
              <Select label="Тип" value={animalForm.animalType}
                onChange={e => setAnimalForm(p => ({ ...p, animalType: e.target.value }))}
                options={ANIMAL_TYPES.map(t => [t, t])} />
              <Select label="Храна" value={animalForm.diet}
                onChange={e => setAnimalForm(p => ({ ...p, diet: e.target.value }))}
                options={DIETS.map(d => [d, d])} />
              <CoordFields
                lat={animalForm.lat} lng={animalForm.lng}
                onLatChange={v => setAnimalForm(p => ({ ...p, lat: v }))}
                onLngChange={v => setAnimalForm(p => ({ ...p, lng: v }))}
              />
            </AddForm>
          )}

          {/* Add attraction */}
          <SectionButton open={openForm === 'attraction'} onClick={() => openForm === 'attraction' ? setOpenForm(null) : openPoiForm('attraction', 'food')}>
            🎠 Добави атракция / хранене
          </SectionButton>
          {openForm === 'attraction' && (
            <AddForm title="Нова атракция / хранене" onSubmit={handleAddPoi} onClose={() => setOpenForm(null)}>
              <Field label="Име (БГ) *" value={poiForm.nameBg}
                onChange={e => setPoiForm(p => ({ ...p, nameBg: e.target.value }))} placeholder="При жирафа" />
              <Select label="Категория" value={poiForm.category}
                onChange={e => setPoiForm(p => ({ ...p, category: e.target.value }))}
                options={['food', 'attraction', 'ticket', 'shop'].map(c => [c, POI_CAT_LABELS[c]])} />
              <CoordFields
                lat={poiForm.lat} lng={poiForm.lng}
                onLatChange={v => setPoiForm(p => ({ ...p, lat: v }))}
                onLngChange={v => setPoiForm(p => ({ ...p, lng: v }))}
              />
            </AddForm>
          )}

          {/* Add service */}
          <SectionButton open={openForm === 'service'} onClick={() => openForm === 'service' ? setOpenForm(null) : openPoiForm('service', 'wc')}>
            🚻 Добави услуга (WC, медицински)
          </SectionButton>
          {openForm === 'service' && (
            <AddForm title="Нова услуга" onSubmit={handleAddPoi} onClose={() => setOpenForm(null)}>
              <Field label="Име (БГ) *" value={poiForm.nameBg}
                onChange={e => setPoiForm(p => ({ ...p, nameBg: e.target.value }))} placeholder="Тоалетна" />
              <Select label="Категория" value={poiForm.category}
                onChange={e => setPoiForm(p => ({ ...p, category: e.target.value }))}
                options={['wc', 'medical', 'entrance', 'parking', 'bus_stop'].map(c => [c, POI_CAT_LABELS[c]])} />
              <CoordFields
                lat={poiForm.lat} lng={poiForm.lng}
                onLatChange={v => setPoiForm(p => ({ ...p, lat: v }))}
                onLngChange={v => setPoiForm(p => ({ ...p, lng: v }))}
              />
            </AddForm>
          )}
        </div>

      </section>}

      {adminUnlocked && <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zoo-brown mb-3">Данни</h2>
        <button
          onClick={handleExport}
          className="w-full bg-[--color-bg-card] border border-[--color-border] rounded-2xl px-4 py-3 text-sm font-semibold text-[--color-text-main] text-left"
        >
          📋 {exported ? 'Копирано!' : 'Копирай animals.json (с промени)'}
        </button>
        <p className="text-xs text-zoo-brown opacity-60 mt-2 px-1">
          Копира пълния JSON с всички добавени животни и координати, готов за поставяне в animals.json.
        </p>
      </section>}

      {/* My progress */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zoo-brown mb-3">Моят напредък</h2>
        <Link
          to="/visited"
          className="w-full bg-[--color-bg-card] border border-[--color-border] rounded-2xl px-4 py-3 flex items-center gap-3"
        >
          <span className="text-xl">✅</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[--color-text-main]">Видени животни</p>
            <p className="text-xs text-zoo-brown opacity-60">{seenCount} от {allAnimals.length} видени</p>
          </div>
          <span className="text-zoo-brown opacity-40 text-lg">›</span>
        </Link>
      </section>

      {/* Save / restore progress */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zoo-brown mb-3">Запази прогреса си</h2>
        {isLinked ? (
          <div className="bg-[--color-bg-card] border border-[--color-border] rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[--color-text-main]">Синхронизирано</p>
              <p className="text-xs text-zoo-brown opacity-60 truncate">{userEmail}</p>
            </div>
          </div>
        ) : (
          <div className="bg-[--color-bg-card] border border-[--color-border] rounded-2xl px-4 py-3">
            <p className="text-xs text-zoo-brown opacity-70 mb-2">
              Любимите и видените животни се пазят на това устройство. Въведете имейл, за да ги възстановите, ако смените телефона или изчистите данните на браузъра.
            </p>
            {progressStatus === 'sent' ? (
              <p className="text-sm font-semibold text-zoo-green">
                📩 Ще получите имейл от <b>Supabase Auth</b> (noreply@mail.app.supabase.io) — отворете го и натиснете линка вътре, за да потвърдите.
              </p>
            ) : (
              <form onSubmit={handleSaveProgress} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="имейл"
                  value={progressEmail}
                  onChange={e => setProgressEmail(e.target.value)}
                  className="flex-1 min-w-0 rounded-xl border border-[--color-border] bg-[--color-bg-base] px-3 py-2 text-sm text-[--color-text-main] outline-none focus:border-zoo-green transition-colors"
                />
                <button
                  type="submit"
                  disabled={progressStatus === 'sending'}
                  className="shrink-0 bg-zoo-primary text-white rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  {progressStatus === 'sending' ? '…' : 'Изпрати'}
                </button>
              </form>
            )}
            {progressStatus === 'error' && (
              <p className="text-xs text-red-500 mt-2">Нещо се обърка. Опитайте отново.</p>
            )}
          </div>
        )}
        {syncStatus === 'error' && (
          <p className="text-[10px] text-red-500 mt-1.5 px-1">Синхронизацията в момента не работи — данните остават запазени на устройството.</p>
        )}
      </section>

      {/* Feedback */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zoo-brown mb-3">Обратна връзка</h2>
        <button
          onClick={() => setFeedbackOpen(true)}
          className="w-full bg-[--color-bg-card] border border-[--color-border] rounded-2xl px-4 py-3 text-left flex items-center gap-3"
        >
          <span className="text-xl">💬</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[--color-text-main]">Изпрати обратна връзка</p>
            <p className="text-xs text-zoo-brown opacity-60">Грешки, идеи или общо мнение</p>
          </div>
          <span className="text-zoo-brown opacity-40 text-lg">›</span>
        </button>
        <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      </section>

      {saved && <p className="text-center text-sm text-zoo-green font-semibold">{saved}</p>}

      {/* Build info */}
      <div className="pt-4 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zoo-green">Зоопарк София</span>
          <button
            onClick={handleBetaTap}
            className="text-[10px] font-bold uppercase tracking-wider bg-zoo-green/15 text-zoo-green px-2 py-0.5 rounded-full active:bg-zoo-green/30 transition-colors"
          >
            Beta
          </button>
        </div>
        <p className="text-xs text-zoo-brown opacity-50">
          v{__APP_VERSION__} · {__BUILD_DATE__}
        </p>
        <p className="text-[10px] text-zoo-brown opacity-30 text-center">
          Неофициално приложение. Не е свързано официално със Зоопарк София.
        </p>
      </div>
      </div>
    </div>
  )
}
