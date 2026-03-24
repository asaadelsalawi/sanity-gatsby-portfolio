import React, {useState, useEffect} from 'react'
import {quranWords} from '../data/quran-words'
import styles from './quran-game.module.css'

const STORAGE_KEY = 'quranGameLearnedIds'

function shuffle (arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateOptions (currentWord, allWords) {
  const others = allWords.filter(w => w.id !== currentWord.id)
  const wrong = shuffle(others).slice(0, 3)
  return shuffle([currentWord, ...wrong])
}

function loadLearnedIds () {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch (_) {
    return new Set()
  }
}

function saveLearnedIds (ids) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch (_) {}
}

const QuranGame = () => {
  const [mode, setMode] = useState('flashcard')
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [learnedIds, setLearnedIds] = useState(() => loadLearnedIds())

  // Quiz state
  const [quizOptions, setQuizOptions] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)

  const words = quranWords
  const currentWord = words[index]

  // Persist learned IDs
  useEffect(() => {
    saveLearnedIds(learnedIds)
  }, [learnedIds])

  // Generate quiz options when word or mode changes
  useEffect(() => {
    if (mode === 'quiz') {
      setQuizOptions(generateOptions(currentWord, words))
      setSelectedId(null)
      setAnswered(false)
    }
  }, [index, mode])

  // Reset flip when navigating
  useEffect(() => {
    setIsFlipped(false)
  }, [index])

  function handleFlip () {
    setIsFlipped(f => !f)
  }

  function markLearned () {
    setLearnedIds(prev => {
      const next = new Set(prev)
      next.add(currentWord.id)
      return next
    })
  }

  function markLearning () {
    setLearnedIds(prev => {
      const next = new Set(prev)
      next.delete(currentWord.id)
      return next
    })
  }

  function goNext () {
    setIndex(i => (i + 1) % words.length)
  }

  function goPrev () {
    setIndex(i => (i - 1 + words.length) % words.length)
  }

  function handleAnswer (option) {
    if (answered) return
    setSelectedId(option.id)
    setAnswered(true)
    setSessionTotal(t => t + 1)
    if (option.id === currentWord.id) {
      setSessionCorrect(c => c + 1)
    }
  }

  function handleQuizNext () {
    goNext()
  }

  function resetProgress () {
    setLearnedIds(new Set())
    setSessionCorrect(0)
    setSessionTotal(0)
    setIndex(0)
  }

  function switchMode (newMode) {
    setMode(newMode)
    setIndex(0)
    setIsFlipped(false)
    setSelectedId(null)
    setAnswered(false)
  }

  const learnedCount = learnedIds.size
  const progressPct = (learnedCount / words.length) * 100

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1>Quran Word Game</h1>
        <p>Learn the most frequent words in the Quran</p>
      </div>

      {/* Mode switcher */}
      <div className={styles.modeTabs}>
        <button
          className={`${styles.modeBtn} ${mode === 'flashcard' ? styles.modeBtnActive : ''}`}
          onClick={() => switchMode('flashcard')}
        >
          Flashcards
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'quiz' ? styles.modeBtnActive : ''}`}
          onClick={() => switchMode('quiz')}
        >
          Quiz
        </button>
      </div>

      {/* Progress bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>Words learned</span>
          <span><span className={styles.scoreNumber}>{learnedCount}</span> / {words.length}</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{width: `${progressPct}%`}} />
        </div>
      </div>

      {mode === 'flashcard' ? (
        <>
          {/* Flashcard */}
          <div className={styles.cardArea} onClick={handleFlip} title='Click to flip'>
            <div className={`${styles.card} ${isFlipped ? styles.flipped : ''}`}>
              <div className={styles.cardFace}>
                <p className={styles.arabic}>{currentWord.arabic}</p>
                <p className={styles.flipHint}>Click to reveal meaning</p>
              </div>
              <div className={`${styles.cardFace} ${styles.cardBack}`}>
                <p className={styles.transliteration}>{currentWord.transliteration}</p>
                <p className={styles.meaning}>{currentWord.english}</p>
                <p className={styles.arabicSmall}>{currentWord.arabic}</p>
              </div>
            </div>
          </div>

          {/* Flashcard actions */}
          <div className={styles.flashcardActions}>
            <button className={styles.btnKnew} onClick={markLearned}>
              Knew it ✓
            </button>
            <button className={styles.btnLearning} onClick={markLearning}>
              Still learning
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Quiz mode */}
          <div className={styles.scoreBar}>
            Session score:{' '}
            <span className={styles.scoreNumber}>{sessionCorrect}</span> / {sessionTotal}
          </div>

          <div className={styles.quizWord}>
            <span className={styles.quizArabic}>{currentWord.arabic}</span>
            <span className={styles.quizTranslit}>{currentWord.transliteration}</span>
          </div>

          <div className={styles.quizOptions}>
            {quizOptions.map(option => {
              let cls = styles.optionBtn
              if (answered) {
                if (option.id === currentWord.id) cls += ` ${styles.optionCorrect}`
                else if (option.id === selectedId) cls += ` ${styles.optionWrong}`
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
            <button className={styles.quizNext} onClick={handleQuizNext}>
              Next word →
            </button>
          )}
        </>
      )}

      {/* Navigation (flashcard mode only) */}
      {mode === 'flashcard' && (
        <div className={styles.navigation}>
          <button className={styles.navBtn} onClick={goPrev}>← Prev</button>
          <span className={styles.navCounter}>{index + 1} / {words.length}</span>
          <button className={styles.navBtn} onClick={goNext}>Next →</button>
        </div>
      )}

      {/* Reset */}
      <button className={styles.resetBtn} onClick={resetProgress}>
        Reset progress
      </button>
    </div>
  )
}

export default QuranGame
