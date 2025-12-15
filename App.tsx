import React, { useState, useEffect, useRef } from 'react';
import { SLIDES } from './constants';
import { Slide } from './components/Slide';
import { GeminiAssistant } from './components/GeminiAssistant';
import { generateSpeech } from './services/geminiService';
import { SpeakingState } from './types';
import { ChevronLeft, ChevronRight, Volume2, Loader2, StopCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [speakingState, setSpeakingState] = useState<SpeakingState>(SpeakingState.IDLE);
  const [hasStarted, setHasStarted] = useState(false); // To handle AudioContext restrictions
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const currentSlide = SLIDES[currentSlideIndex];

  // Initialize Audio Context on user interaction
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setHasStarted(true);
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceNodeRef.current = null;
    }
    setSpeakingState(SpeakingState.IDLE);
  };

  const playNarration = async () => {
    if (!audioContextRef.current) {
        initAudio();
    }
    
    // If currently speaking, stop it
    if (speakingState === SpeakingState.SPEAKING) {
        stopAudio();
        return;
    }

    setSpeakingState(SpeakingState.LOADING);

    try {
        const buffer = await generateSpeech(currentSlide.speechText, audioContextRef.current!);
        
        // Stop any previous audio before starting new
        stopAudio();

        const source = audioContextRef.current!.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current!.destination);
        
        source.onended = () => {
            setSpeakingState(SpeakingState.IDLE);
            sourceNodeRef.current = null;
        };

        sourceNodeRef.current = source;
        source.start();
        setSpeakingState(SpeakingState.SPEAKING);

    } catch (error) {
        console.error("Narration failed", error);
        setSpeakingState(SpeakingState.IDLE);
        alert("語音生成失敗，請稍後再試");
    }
  };

  // Stop audio when slide changes
  useEffect(() => {
    stopAudio();
  }, [currentSlideIndex]);

  const nextSlide = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-500 to-blue-600 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">歡迎來到 AI 課程</h1>
            <p className="text-xl text-gray-600 mb-8">
                為了讓您有最好的體驗，我們將啟用語音導覽功能。請點擊下方按鈕開始。
            </p>
            <button 
                onClick={initAudio}
                className="bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-lg transition-transform transform hover:scale-105"
            >
                開始課程
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 md:p-8">
      {/* Header / Progress */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <div className="text-gray-600 font-medium text-lg">
            第 {currentSlideIndex + 1} 頁，共 {SLIDES.length} 頁
        </div>
        <div className="flex gap-2">
            {SLIDES.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlideIndex ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'}`} 
                />
            ))}
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="w-full max-w-6xl flex-1 relative min-h-[600px] mb-8">
        <AnimatePresence mode='wait'>
            <motion.div
                key={currentSlideIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full"
            >
                <Slide data={currentSlide} />
            </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4 md:p-6 shadow-lg z-40">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            
            {/* Prev Button */}
            <button 
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xl font-bold transition-all ${
                    currentSlideIndex === 0 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100 active:scale-95'
                }`}
            >
                <ChevronLeft size={32} />
                <span className="hidden md:inline">上一頁</span>
            </button>

            {/* AI Narrator Button */}
            <button 
                onClick={playNarration}
                className={`flex items-center gap-3 px-8 py-4 rounded-full text-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                    speakingState === SpeakingState.SPEAKING 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : speakingState === SpeakingState.LOADING
                    ? 'bg-gray-400 cursor-wait'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
            >
                {speakingState === SpeakingState.LOADING ? (
                    <Loader2 className="animate-spin" size={28} />
                ) : speakingState === SpeakingState.SPEAKING ? (
                    <StopCircle size={28} />
                ) : (
                    <Volume2 size={28} />
                )}
                <span>
                    {speakingState === SpeakingState.LOADING ? "生成中..." : 
                     speakingState === SpeakingState.SPEAKING ? "停止講解" : "AI 講解"}
                </span>
            </button>

            {/* Next Button */}
            <button 
                onClick={nextSlide}
                disabled={currentSlideIndex === SLIDES.length - 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xl font-bold transition-all ${
                    currentSlideIndex === SLIDES.length - 1
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100 active:scale-95'
                }`}
            >
                <span className="hidden md:inline">下一頁</span>
                <ChevronRight size={32} />
            </button>
        </div>
      </div>
      
      {/* Floating AI Chat Assistant */}
      <GeminiAssistant />
    </div>
  );
}