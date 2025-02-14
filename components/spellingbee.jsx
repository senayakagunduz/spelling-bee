"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Volume2, RefreshCw } from "lucide-react";

const SpellingGame = () => {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [mistakes, setMistakes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Kelimeleri yükle
  useEffect(() => {
    const loadWords = async () => {
      try {
        const response = await fetch('/words.json');
        const data = await response.json();
        setWords(data.words);
      } catch (error) {
        console.error('Kelimeler yüklenirken hata:', error);
      }
    };
    loadWords();
  }, []);

  // Yeni kelime seç
  const selectNewWord = () => {
    if (words.length > 0) {
      const randomIndex = Math.floor(Math.random() * words.length);
      setCurrentWord(words[randomIndex].word);
      setUserInput('');
      setShowResult(false);
      setMistakes([]);
      setGameStarted(true);
    }
  };

  // Kelimeyi seslendir
  const speakWord = () => {
    if ('speechSynthesis' in window) {
      // Mevcut konuşmayı durdur
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(currentWord);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; // Konuşma hızını biraz yavaşlat
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Tarayıcınız ses özelliğini desteklemiyor.');
    }
  };

  // Hataları bul
  const findMistakes = (input, correct) => {
    const mistakes = [];
    const minLength = Math.min(input.length, correct.length);
    
    for (let i = 0; i < minLength; i++) {
      if (input[i].toLowerCase() !== correct[i].toLowerCase()) {
        mistakes.push(i);
      }
    }
    
    // Eksik veya fazla harfleri işaretle
    if (input.length !== correct.length) {
      for (let i = minLength; i < Math.max(input.length, correct.length); i++) {
        mistakes.push(i);
      }
    }
    
    return mistakes;
  };

  // Cevabı kontrol et
  const checkAnswer = () => {
    if (!userInput) return;

    const foundMistakes = findMistakes(userInput, currentWord);
    setMistakes(foundMistakes);
    setShowResult(true);

    // Skor hesapla
    if (foundMistakes.length === 0) {
      setScore(prevScore => prevScore + 10);
    }
  };

  // Enter tuşu ile kontrol
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Spelling Bee
          {gameStarted && <span className="text-sm ml-2">Skor: {score}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!gameStarted ? (
          <Button 
            onClick={selectNewWord}
            className="w-full"
          >
            Oyunu Başlat
          </Button>
        ) : (
          <>
            <div className="flex justify-between items-center gap-2">
              <Button 
                onClick={speakWord}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Kelimeyi Dinle
              </Button>
              <Button 
                onClick={selectNewWord}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Yeni Kelime
              </Button>
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Duyduğunuz kelimeyi yazın..."
                className="w-full"
              />
              <Button 
                onClick={checkAnswer}
                className="w-full"
                disabled={!userInput}
              >
                Kontrol Et
              </Button>
            </div>

            {showResult && (
              <div className="mt-4 space-y-2">
                <p className="text-lg font-semibold">
                  Doğru kelime: {currentWord}
                </p>
                <p className="font-medium">
                  Sizin yazımınız: {' '}
                  {userInput.split('').map((char, index) => (
                    <span
                      key={index}
                      className={
                        mistakes.includes(index) 
                          ? "text-red-500 font-bold"
                          : "text-green-500"
                      }
                    >
                      {char}
                    </span>
                  ))}
                </p>
                {mistakes.length === 0 ? (
                  <p className="text-green-500">
                    Tebrikler! Doğru yazdınız! (+10 puan)
                  </p>
                ) : (
                  <p className="text-red-500">
                    {mistakes.length} harf hatalı
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SpellingGame;