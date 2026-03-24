import React, { useState, useEffect } from 'react'
import { quranWords } from '../data/quran-words'
import './QuranGame.css'

const STORAGE_KEY = 'quranGameLearnedIds'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateOptions(currentWord, allWords) {
  const others = allWords.filter(w => w.id !== currentWord.id)
  const wrong = shuffle(others).slice(0, 3)
  return shuffle([currentWord, ...wrong])
}

function loadLearnedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch (_) {
    return new Set()
  }
}

function saveLearnedIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch (_) {}
}

export default function QuranGame() {
  const [mode, setMode] = useState('flashcard')
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [learnedIds, setLearnedIds] = useState(() => loadLearnedIds())

  const [quizOptions, setQuizOptions] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)

  const words = quranWords
  const currentWord = words[index]

  useEffect(() => { saveLearnedIds(learnedIds) }, [learnedIds])

  useEffect(() => {
    if (mode === 'quiz') {
      setQuizOptions(generateOptions(currentWord, words))
      setSelectedId(null)
      setAnswered(false)
    }
  }, [index, mode])

  useEffect(() => { setIsFlipped(false) }, [index])

  function markLearned() {
    setLearnedIds(prev => { const next = new Set(prev); next.add(currentWord.id); return next })
  }

  function markLearning() {
    setLearnedIds(prev => { const next = new Set(prev); next.delete(currentWord.id); return next })
  }

  function goNext() { setIndex(i => (i + 1) % words.length) }
  function goPrev() { setIndex(i => (i - 1 + words.length) % words.length) }

  function handleAnswer(option) {
    if (answered) return
    setSelectedId(option.id)
    setAnswered(true)
    setSessionTotal(t => t + 1)
    if (option.id === currentWord.id) setSessionCorrect(c => c + 1)
  }

  function resetProgress() {
    setLearnedIds(new Set())
    setSessionCorrect(0)
    setSessionTotal(0)
    setIndex(0)
  }

  function switchMode(newMode) {
    setMode(newMode)
    setIndex(0)
    setIsFlipped(false)
    setSelectedId(null)
    setAnswered(false)
  }

  const learnedCount = learnedIds.size
  const progressPct = (learnedCount / words.length) * 100

  return (
    <div className="quran-game">
      <div className="quran-game__header">
        <h1>Quran Word Game</h1>
        <p>Learn the most frequent words in the Quran</p>
      </div>

      <div className="quran-game__tabs">
        <button
          className={`quran-game__tab${mode === 'flashcard' ? ' quran-game__tab--active' : ''}`}
          onClick={() => switchMode('flashcard')}
        >
          Flashcards
        </button>
        <button
          className={`quran-game__tab${mode === 'quiz' ? ' quran-game__tab--active' : ''}`}
          onClick={() => switchMode('quiz')}
        >
          Quiz
        </button>
      </div>

      <div className="quran-game__progress">
        <div className="quran-game__progress-label">
          <span>Words learned</span>
          <span><strong>{learnedCount}</strong> / {words.length}</span>
        </div>
        <div className="quran-game__progress-bar">
          <div className="quran-game__progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {mode === 'flashcard' ? (
        <>
          <div className="quran-game__card-area" onClick={() => setIsFlipped(f => !f)} title="Click to flip">
            <div className={`quran-game__card${isFlipped ? ' quran-game__card--flipped' : ''}`}>
              <div className="quran-game__card-face">
                <p className="quran-game__arabic">{currentWord.arabic}</p>
                <p className="quran-game__flip-hint">Click to reveal meaning</p>
              </div>
              <div className="quran-game__card-face quran-game__card-back">
                <p className="quran-game__transliteration">{currentWord.transliteration}</p>
                <p className="quran-game__meaning">{currentWord.english}</p>
                <p className="quran-game__arabic-small">{currentWord.arabic}</p>
              </div>
            </div>
          </div>

          <div className="quran-game__flashcard-actions">
            <button className="quran-game__btn-knew" onClick={markLearned}>Knew it ✓</button>
            <button className="quran-game__btn-learning" onClick={markLearning}>Still learning</button>
          </div>
        </>
      ) : (
        <>
          <div className="quran-game__score-bar">
            Session score: <strong>{sessionCorrect}</strong> / {sessionTotal}
          </div>

          <div className="quran-game__quiz-word">
            <span className="quran-game__quiz-arabic">{currentWord.arabic}</span>
            <span className="quran-game__quiz-translit">{currentWord.transliteration}</span>
          </div>

          <div className="quran-game__quiz-options">
            {quizOptions.map(option => {
              let cls = 'quran-game__option-btn'
              if (answered) {
                if (option.id === currentWord.id) cls += ' quran-game__option-btn--correct'
                else if (option.id === selectedId) cls += ' quran-game__option-btn--wrong'
              }
              return (
                <button
                  key={option.id}
                  className={cls}
                  onClick={() => handleAnswer(option)}
                  disabled={answered}
                >
                  {option.english}
                </button>
              )
            })}
          </div>

          {answered && (
            <button className="quran-game__quiz-next" onClick={goNext}>Next word →</button>
          )}
        </>
      )}

      {mode === 'flashcard' && (
        <div className="quran-game__nav">
          <button className="quran-game__nav-btn" onClick={goPrev}>← Prev</button>
          <span className="quran-game__nav-counter">{index + 1} / {words.length}</span>
          <button className="quran-game__nav-btn" onClick={goNext}>Next →</button>
        </div>
      )}

      <button className="quran-game__reset-btn" onClick={resetProgress}>Reset progress</button>
    </div>
  )
}
