import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw, Download, Wand2, Images, Trash2, Save, ArrowLeft, LayoutGrid, Upload, Sparkles, Star, Share2, Pencil, Check, Key, X, Zap, Heart, Bot, Eye, Bell, Palette, Box, Smile } from 'lucide-react';
import { AppState, StyleOption, GeneratedResult, GalleryItem } from './types';
import { STYLES } from './constants';
import * as GeminiService from './services/geminiService';
import * as GalleryService from './services/galleryService';
import { Button } from './components/Button';
import { Loading } from './components/Loading';

// Simple 2D flat "Sketchyz" characters for each style
const StyleCharacter: React.FC<{ id: string }> = ({ id }) => {
  const containerClass = "w-20 h-20 bg-white border-2 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0_rgba(0,0,0,0.1)] transform transition-transform group-hover:scale-110 group-hover:rotate-3";

  switch (id) {
    case 'comic':
      return (
        <div className={containerClass}>
          <Zap size={40} className="text-black fill-[#FFD93D]" strokeWidth={2.5} />
        </div>
      );
    case 'cartoon':
      return (
        <div className={containerClass}>
          <Box size={40} className="text-black fill-[#FF66C4]" strokeWidth={2.5} />
        </div>
      );
    case 'watercolor':
      return (
        <div className={containerClass}>
          <Palette size={40} className="text-black fill-[#FF6B6B]" strokeWidth={2.5} />
        </div>
      );
    case 'sketch':
      return (
        <div className={containerClass}>
          <Pencil size={40} className="text-black fill-gray-200" strokeWidth={2.5} />
        </div>
      );
    case 'clay':
      return (
        <div className={containerClass}>
          <Smile size={40} className="text-black fill-[#FFD93D]" strokeWidth={2.5} />
        </div>
      );
    case 'realism':
      return (
        <div className={containerClass}>
          <Camera size={40} className="text-black fill-[#4DE1C1]" strokeWidth={2.5} />
        </div>
      );
    case 'lucky':
      return (
        <div className={containerClass}>
          <Sparkles size={40} className="text-black fill-[#FFD93D]" strokeWidth={2.5} />
        </div>
      );
    default:
      return <Star className="text-white" />;
  }
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [drawingSubject, setDrawingSubject] = useState<string>("");
  const [userContextInput, setUserContextInput] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(null);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("Getting things ready...");
  const [error, setError] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>(""); // Store prompt for editing
  const [useResultAsInput, setUseResultAsInput] = useState<boolean>(false); // Iterative toggle
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const [generationCount, setGenerationCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('sketchyz_gen_count') || '0');
  });
  const MAX_GENERATIONS = 5;

  useEffect(() => {
    localStorage.setItem('sketchyz_gen_count', generationCount.toString());
  }, [generationCount]);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- Initial Load ---
  useEffect(() => {
    const loadInitialGallery = async () => {
      try {
        const items = await GalleryService.getGallery();
        setGalleryItems(items);
      } catch (e) {
        console.error("Failed to pre-load gallery:", e);
      }
    };

    const checkApiKey = async () => {
      // 1. Check for Environment Variable Key (Secure Option)
      // Vite exposed env vars must start with VITE_
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        setHasApiKey(true);
        return;
      }

      // 2. Check for Project IDX / AI Studio Key
      if (window.aistudio?.hasSelectedApiKey) {
        const isSelected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(isSelected);
      }
    };

    loadInitialGallery();
    checkApiKey();
  }, []);

  // Handle Camera stream logic
  useEffect(() => {
    if (appState === AppState.LIVE_CAMERA) {
      const initCamera = async () => {
        try {
          const constraints = {
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(e => console.error("Video play failed:", e));
            };
          }
        } catch (err) {
          console.error("Camera initialization error:", err);
          setError("We couldn't open your camera. Try uploading a file instead!");
          setAppState(AppState.CAMERA);
        }
      };

      initCamera();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [appState, facingMode]);

  // --- Handlers ---

  const handleOpenMagicKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleStart = () => {
    if (!hasApiKey) {
      setError("Please unlock the pro magic with a key first!");
      return;
    }
    setAppState(AppState.CAMERA);
    setError(null);
  };

  const startLiveCamera = () => {
    setAppState(AppState.LIVE_CAMERA);
    setError(null);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };



  const capturePhoto = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setOriginalImage(dataUrl);
        setAppState(AppState.CONTEXT_INPUT);
      }
    }
  };

  const handleOpenGallery = async () => {
    setLoadingMessage("Opening your gallery...");
    try {
      const items = await GalleryService.getGallery();
      setGalleryItems(items);
      setAppState(AppState.GALLERY);
    } catch (e) {
      console.error(e);
      setError("Couldn't open the gallery. Sorry!");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setUserContextInput("");
        setAppState(AppState.CONTEXT_INPUT);
      };
      reader.readAsDataURL(file);
    }
  };



  const analyzeImage = async (base64Image: string) => {
    setAppState(AppState.ANALYZING);
    setLoadingMessage("Looking at your drawing...");
    try {
      const subject = await GeminiService.identifySubject(base64Image);
      setDrawingSubject(subject);
      setAppState(AppState.STYLE_SELECT);
    } catch (e) {
      console.error(e);
      handleApiError(e);
    }
  };

  const handleApiError = (e: any) => {
    if (e?.message?.includes("Requested entity was not found")) {
      setHasApiKey(false);
      setError("Magic key issue! Please select your key again.");
      setAppState(AppState.WELCOME);
    } else {
      setError("Oh no! The magic spell fizzled out. Please try again!");
      setAppState(AppState.CAMERA);
    }
  };

  const handleStyleSelect = async (style: StyleOption) => {
    setSelectedStyle(style);

    if (generationCount >= MAX_GENERATIONS) {
      alert("You've used all 5 free generations! Share the app to unlock more (just kidding, that's the limit for now!).");
      return;
    }

    setAppState(AppState.PROCESSING);
    setLoadingMessage("Creating your masterpiece...");
    setHasSaved(false);

    try {
      // Small pause for "Waking up"
      await new Promise(r => setTimeout(r, 1500));

      let subject = drawingSubject || await GeminiService.identifySubject(originalImage!);
      // Double-check: clean "a" or "an" just in case the model slipped up
      subject = subject.replace(/^(a|an|the)\s+/i, "");
      setDrawingSubject(subject);

      setLoadingMessage(`I spy with my robot eye... a ${subject}!`);

      // Artificial delay to let them read the "Thinking" message
      await new Promise(r => setTimeout(r, 2000));

      const brainResponse = await GeminiService.getBrainResponse(
        'style_description',
        style.id,
        subject,
        'after_generation'
      );

      const promptToUse = brainResponse.style_prompt || style.description;
      setCurrentPrompt(promptToUse);
      setSelectedStyle(style);

      // Dynamic fun messages logic
      const funPhrases = [
        `Teaching the pixels to draw your ${subject}...`,
        `Mixing up magic colors for your ${subject}!`,
        `Sprinkling creative dust on your ${subject}...`,
        `Dreaming up a wild ${subject} for you...`,
        `Asking the art wizard about your ${subject}!`,
      ];
      const randomPhrase = funPhrases[Math.floor(Math.random() * funPhrases.length)];
      setLoadingMessage(randomPhrase);

      // Allow the painting message to be seen before the heavy lifting starts/finishes
      await new Promise(r => setTimeout(r, 1500));

      const styledImage = await GeminiService.generateStyledImage(originalImage!, promptToUse);
      setGenerationCount(prev => prev + 1);

      setResult({
        originalImage: originalImage!,
        styledImage,
        styleId: style.id,
        message: brainResponse.kid_message || "Wow! You made art!",
        subject: subject
      });

      setAppState(AppState.RESULT);
    } catch (e) {
      console.error(e);
      handleApiError(e);
    }
  };



  const handleAcceptContext = () => {
    if (userContextInput.trim().length > 0) {
      setDrawingSubject(userContextInput.trim());
    }
    // Proceed to style selection
    setAppState(AppState.STYLE_SELECT);
  };

  const handleContextSubmit = async () => {
    // This function is now ONLY for the final submission from Style Select (if we kept the logic there), 
    // but we moved it to handleStyleSelect. 
    // We can keep this as a safety wrapper or just use handleStyleSelect directly in the style buttons.
    // For now, let's leave it as the 'Generate' logic, but NOT call it from the context screen.
    if (!selectedStyle) {
      alert("Please pick a magic style first!");
      return;
    }
    await handleStyleSelect(selectedStyle);
  };

  const handleRegenerate = async () => {
    if (!originalImage || !currentPrompt) return;

    // DECISION: Use original sketch OR the last result?
    // If 'useResultAsInput' is checked AND we have a result, use that.
    const inputImage = (useResultAsInput && result?.styledImage) ? result.styledImage : originalImage;

    setAppState(AppState.PROCESSING); // Re-use processing state
    setHasSaved(false);

    try {
      const generatedImageBase64 = await GeminiService.generateStyledImage(inputImage, currentPrompt);

      setResult(prev => prev ? {
        ...prev,
        styledImage: generatedImageBase64
      } : null);

      setAppState(AppState.RESULT);
    } catch (e) {
      console.error(e);
      handleApiError(e);
    }
  };

  const handleReset = () => {
    setAppState(AppState.WELCOME);
    setOriginalImage(null);
    setResult(null);
    setSelectedStyle(null);
    setDrawingSubject("");
    setUserContextInput("");
    setHasSaved(false);
  };

  const handleSaveToGallery = async () => {
    if (!result || hasSaved) return;

    setIsSaving(true);
    try {
      await GalleryService.saveToGallery({
        originalImage: result.originalImage,
        styledImage: result.styledImage,
        styleId: result.styleId,
        message: result.message
      });
      const updatedItems = await GalleryService.getGallery();
      setGalleryItems(updatedItems);
      setHasSaved(true);
    } catch (e) {
      console.error(e);
      alert("Oops! Your device storage might be full.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Do you want to delete this masterpiece?")) {
      await GalleryService.deleteFromGallery(id);
      setGalleryItems(items => items.filter(item => item.id !== id));
    }
  };

  const handleDownload = (imageUrl: string, styleId: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `sketchyz-${styleId}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (imageUrl: string, styleId: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'sketchyz-art.png', { type: 'image/png' });

      // Look up style name
      const styleName = STYLES.find(s => s.id === styleId)?.name || "Magic";

      if (navigator.share) {
        await navigator.share({
          title: 'My Sketchyz Masterpiece',
          text: `Check out this masterpiece I brought to life with Sketchyz! ✨🎨 #sketchyz #${styleName.replace(/\s+/g, '')}\n\nTry 5 free generations yourself!`,
          files: [file],
        });
      } else {
        alert("Sharing isn't supported on this device. Try downloading it instead!");
      }
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleResumeFromGallery = (item: GalleryItem) => {
    setOriginalImage(item.originalImage);
    const style = STYLES.find(s => s.id === item.styleId);
    setSelectedStyle(style || null);

    setResult({
      originalImage: item.originalImage,
      styledImage: item.styledImage,
      styleId: item.styleId,
      message: item.message,
      // We don't save subject in gallery item currently, but we can try to guess or leave empty
      // Ideally we should update GalleryItem to store subject, but for now strict type matching:
      subject: ""
    });

    setAppState(AppState.RESULT);
  };

  // --- Render Functions ---

  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center overflow-hidden">

      <div className="mb-6 relative z-10 flex flex-col items-center">
        <div className="relative mb-4 animate-float z-20">
          <div className="relative w-14 h-36 md:w-20 md:h-48 transform rotate-[15deg] drop-shadow-xl">
            <div className="h-[15%] w-full bg-[#FF66C4] rounded-t-xl border-4 border-black border-b-0"></div>
            <div className="h-[10%] w-full bg-gray-300 border-4 border-black border-b-0 flex gap-1 justify-center items-center">
              <div className="w-1 h-full bg-black/10"></div>
              <div className="w-1 h-full bg-black/10"></div>
            </div>
            <div className="h-[55%] w-full bg-[#4DE1C1] border-4 border-black border-b-0 flex items-center justify-center">
              <div className="w-1/3 h-full border-x-4 border-black/10"></div>
            </div>
            <div className="h-[20%] w-full relative flex justify-center">
              {/* 1. Black Outline (The "Stroke") */}
              <div className="absolute top-0 border-l-[28px] border-r-[28px] border-t-[36px] md:border-l-[40px] md:border-r-[40px] md:border-t-[48px] border-l-transparent border-r-transparent border-t-black"></div>

              {/* 2. Yellow Wood (The "Fill") - 4px smaller to show border */}
              <div className="absolute top-0 border-l-[24px] border-r-[24px] border-t-[32px] md:border-l-[36px] md:border-r-[36px] md:border-t-[44px] border-l-transparent border-r-transparent border-t-[#FFD93D]"></div>

              {/* 3. Graphite Tip - Positioned to cap the point */}
              <div className="absolute top-[22px] md:top-[30px] border-l-[8px] border-r-[8px] border-t-[10px] md:border-l-[12px] md:border-r-[12px] md:border-t-[14px] border-l-transparent border-r-transparent border-t-black"></div>
            </div>
            <div className="absolute top-1/4 -right-10 text-[#FFD93D] animate-spin">
              <Star size={36} fill="#FFD93D" strokeWidth={3} className="text-black" />
            </div>
            <div className="absolute bottom-1/4 -left-8 text-[#FF66C4] animate-bounce">
              <Sparkles size={28} fill="#FF66C4" strokeWidth={3} className="text-black" />
            </div>
          </div>
        </div>

        <h1 className="text-7xl md:text-9xl font-black text-[#1a1a1a] tracking-tight z-10 relative font-logo leading-none lowercase">
          sketchyz
        </h1>

        <div className="mt-6 bg-[#FFD93D] inline-block px-8 py-3 rounded-full hand-border hand-shadow-sm transform rotate-2 animate-wiggle-slow">
          <p className="text-xl md:text-2xl font-bold text-[#1a1a1a] font-logo lowercase flex items-center justify-center gap-2">
            draw. snap. magic!
            <Sparkles size={24} fill="white" strokeWidth={3} className="text-black" />
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs z-10 relative">
        {!hasApiKey ? (
          <div className="flex flex-col gap-3">
            <div className="bg-white p-4 rounded-3xl hand-border hand-shadow-sm mb-2">
              <Key className="mx-auto mb-2 text-[#FFD93D]" size={40} />
              <h3 className="text-lg font-black mb-1">Pro Magic Locked</h3>
              <p className="text-xs font-bold text-gray-500 mb-3">
                To unlock, add your API Key to a <code className="bg-gray-200 px-1 rounded">.env.local</code> file or use Project IDX.
              </p>
              <a
                href="https://ai.google.dev/gemini-api/docs/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline text-xs font-bold"
              >
                Learn about magic keys
              </a>
            </div>
            <Button onClick={handleOpenMagicKey} className="w-full text-xl py-5 bg-[#FFD93D] !text-black" icon={<Star size={28} />}>
              Unlock Pro Magic
            </Button>
          </div>
        ) : (
          <>
            <Button onClick={handleStart} className="w-full text-xl py-5 bg-[#FF66C4]" icon={<Wand2 size={28} />}>
              Start Creating!
            </Button>
            <Button onClick={handleOpenGallery} variant="secondary" className="w-full text-xl py-5 bg-[#4DE1C1] text-black relative" icon={<Images size={28} />}>
              My Gallery

            </Button>
          </>
        )}
      </div>

      {error && (
        <div className="mt-6 bg-[#FF6B6B] text-white p-4 rounded-xl font-bold hand-border hand-shadow-sm animate-pulse text-center">
          {error}
        </div>
      )}
    </div>
  );

  const renderCameraSelection = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-4xl font-black text-[#1a1a1a] mb-8 text-center bg-[#FFD93D] px-6 py-2 rounded-xl hand-border hand-shadow-sm transform -rotate-2 font-logo lowercase">
        Let's get your drawing!
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        <input
          type="file"
          accept="image/*"
          ref={galleryInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={startLiveCamera}
          className="bg-[#4DE1C1] hand-border hand-shadow hand-shadow-hover rounded-3xl h-72 flex flex-col items-center justify-center gap-6 group cursor-pointer transition-all relative overflow-hidden"
        >
          <div className="bg-white p-6 rounded-full hand-border hand-shadow-sm group-hover:scale-110 transition-transform">
            <Camera size={56} className="text-[#1a1a1a]" />
          </div>
          <span className="text-3xl font-black text-[#1a1a1a] font-logo lowercase">Snap Photo</span>
        </button>

        <button
          onClick={() => galleryInputRef.current?.click()}
          className="bg-[#FF66C4] hand-border hand-shadow hand-shadow-hover rounded-3xl h-72 flex flex-col items-center justify-center gap-6 group cursor-pointer transition-all relative overflow-hidden"
        >
          <div className="bg-white p-6 rounded-full hand-border hand-shadow-sm group-hover:scale-110 transition-transform">
            <Upload size={56} className="text-[#1a1a1a]" />
          </div>
          <span className="text-3xl font-black text-[#1a1a1a] font-logo lowercase">Upload File</span>
        </button>

      </div>

      {error && (
        <div className="mt-8 bg-[#FF6B6B] text-white p-4 rounded-xl font-bold hand-border hand-shadow-sm text-center">
          {error}
        </div>
      )}

      <Button variant="secondary" onClick={() => setAppState(AppState.WELCOME)} className="mt-12 bg-white !text-black hover:!bg-gray-100 font-logo lowercase">
        <ArrowLeft size={20} /> Back
      </Button>
    </div>
  );

  const renderLiveCamera = () => (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      <div className="p-4 flex justify-between items-center text-white z-10">
        <button onClick={() => setAppState(AppState.CAMERA)} className="p-3 bg-black/40 rounded-full backdrop-blur-md border-2 border-white/20">
          <ArrowLeft size={28} />
        </button>
        <span className="font-black text-xl tracking-widest lowercase font-logo">sketchyz cam</span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />

        <div className="absolute top-8 right-8 z-50">
          <button
            onClick={toggleCamera}
            className="p-4 bg-[#FFD93D] rounded-full border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            <RotateCcw size={32} className="text-black" strokeWidth={3} />
          </button>
        </div>

        {/* Magic Frame Overlay - Adjusted with padding and constraints to prevent cropping */}
        <div className="absolute inset-0 pointer-events-none p-12 md:p-16 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full max-w-full max-h-full aspect-[3/4] border-white border-[6px] rounded-[40px] hand-border relative transition-all duration-300">
            <div className="absolute -top-6 -left-6 text-[#FFD93D] drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
              <Star size={52} fill="#FFD93D" strokeWidth={3} className="text-black" />
            </div>
            <div className="absolute -bottom-6 -right-6 text-[#FF66C4] drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
              <Sparkles size={52} fill="#FF66C4" strokeWidth={3} className="text-black" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-10 flex flex-col items-center gap-4 bg-gradient-to-t from-black/80 to-transparent">
        <button
          onClick={capturePhoto}
          className="w-24 h-24 rounded-full bg-white border-[8px] border-gray-300 shadow-xl flex items-center justify-center active:scale-90 transition-transform group"
        >
          <div className="w-16 h-16 rounded-full bg-[#FF66C4] group-active:bg-[#FFD93D] transition-colors flex items-center justify-center">
            <Zap size={32} className="text-white fill-current" />
          </div>
        </button>
        <p className="text-white font-bold text-sm uppercase tracking-widest drop-shadow-md font-logo">Capture Magic!</p>
      </div>
    </div>
  );

  const renderContextInput = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-3xl font-black text-[#1a1a1a] mb-6 text-center bg-[#FFD93D] px-6 py-2 rounded-xl hand-border hand-shadow-sm transform rotate-1 font-logo lowercase">
        Wow that's a masterpiece!
      </h2>

      <div className="w-full max-w-md bg-white p-4 rounded-3xl hand-border hand-shadow mb-6">
        {originalImage && (
          <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-[#1a1a1a] mb-4 bg-gray-100">
            <img src={originalImage} alt="Your drawing" className="w-full h-full object-contain" />
          </div>
        )}

        <div className="relative">
          <Pencil className="absolute top-4 left-4 text-gray-500" size={24} />
          <textarea
            value={userContextInput}
            onChange={(e) => setUserContextInput(e.target.value)}
            placeholder="Add additional details here..."
            className="w-full h-32 pl-12 pr-4 py-4 text-lg font-bold bg-[#1a1a1a] text-white placeholder-gray-500 border-4 border-[#1a1a1a] rounded-xl focus:outline-none focus:border-[#4DE1C1] resize-none"
          />
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-md">
        <Button variant="secondary" onClick={() => setAppState(AppState.CAMERA)} className="flex-1 bg-white !text-black border-2 border-black font-logo lowercase">
          <ArrowLeft size={20} /> Retry
        </Button>
        <Button onClick={handleAcceptContext} className="flex-1 bg-[#FF66C4] !text-black font-logo lowercase" icon={<Check size={24} />}>
          Choose Style
        </Button>
      </div>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loading message={loadingMessage} />
    </div>
  );

  const renderStyleSelect = () => (
    <div className="flex flex-col min-h-screen">
      <div className="p-6 pb-2 text-center">
        <div className="inline-block bg-[#FFD93D] px-6 py-3 rounded-2xl hand-border hand-shadow-sm transform -rotate-1 mb-4">
          <h2 className="text-3xl font-black text-[#1a1a1a] font-logo lowercase">Pick a Magic Style!</h2>
        </div>
        <p className="text-xl font-bold text-gray-500 bg-white/50 inline-block px-4 py-1 rounded-full border-2 border-gray-200">
          I see... <span className="text-black">{drawingSubject}!</span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleSelect(style)}
              className={`${style.color} rounded-2xl p-4 flex flex-col items-center justify-center hand-border hand-shadow hand-shadow-hover min-h-[180px] group transition-all`}
            >
              <div className="mb-4 transform group-hover:scale-110 transition-transform drop-shadow-lg">
                <StyleCharacter id={style.id} />
              </div>
              <span className="font-logo font-black text-xl text-[#1a1a1a] tracking-tight text-center leading-tight lowercase">{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 text-center bg-white/50 backdrop-blur-sm border-t-4 border-[#1a1a1a]">
        <Button variant="secondary" onClick={() => setAppState(AppState.CAMERA)} className="bg-white !text-black font-logo lowercase">
          Pick different photo
        </Button>
      </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF9F0]">
      <Loading message={loadingMessage} />

    </div>
  );

  const renderResult = () => (
    <div className="flex flex-col min-h-screen bg-[#1a1a1a] text-white">
      <div className="p-6 text-center relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <h2 className="text-5xl font-black text-[#FFD93D] drop-shadow-[4px_4px_0_rgba(0,0,0,1)] mb-4 relative z-10 transform -rotate-2 font-logo lowercase">
          Ta-da!
        </h2>
        {result?.message && (
          <p className="text-xl font-bold text-[#1a1a1a] bg-white border-4 border-[#1a1a1a] shadow-[4px_4px_0_white] px-6 py-3 rounded-2xl inline-block relative z-10 transform rotate-1">
            "{result.message}"
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 gap-6 md:gap-10 relative z-10">

        <div className="relative group w-full max-w-md aspect-square rounded-3xl overflow-hidden hand-border shadow-[8px_8px_0_#FFF] bg-white">
          {result?.styledImage && (
            <img
              src={result.styledImage}
              alt="Magic Result"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-4 right-4 bg-[#FF66C4] text-white font-bold px-4 py-2 rounded-xl hand-border shadow-[2px_2px_0_#000] text-sm transform -rotate-2 font-logo lowercase">
            {selectedStyle?.name} Style
          </div>
        </div>

        <div className="w-32 md:w-40 aspect-square rounded-2xl overflow-hidden hand-border shadow-[4px_4px_0_#888] bg-white transform rotate-3 hover:rotate-0 transition-transform">
          {result?.originalImage && (
            <img
              src={result.originalImage}
              alt="Original"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] text-center py-1 font-bold font-logo lowercase">Original</div>
        </div>

      </div>

      <div className="p-8 bg-[#FFF9F0] border-t-4 border-black rounded-t-[40px] flex flex-col gap-6 relative z-20">

        {/* EDIT PROMPT SECTION */}
        <div className="bg-white p-4 rounded-2xl hand-border hand-shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
            <label className="text-black font-bold font-logo lowercase">Refine the magic spell:</label>

            {/* STYLE SWITCHER */}
            <div className="relative">
              <select
                value={selectedStyle?.id}
                onChange={(e) => {
                  const newStyle = STYLES.find(s => s.id === e.target.value);
                  if (newStyle) {
                    setSelectedStyle(newStyle);
                    // Reset prompt to default for this new style to give them a fresh start
                    // FIXED: 'styleBrain' is not available here. Use template string fallback.
                    setCurrentPrompt(`${newStyle.name} style of ${drawingSubject}`);
                  }
                }}
                className="appearance-none bg-gray-100 border-2 border-black rounded-lg py-1 pl-3 pr-8 font-bold text-sm focus:outline-none focus:border-[#4DE1C1] cursor-pointer text-black"
              >
                {STYLES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <ArrowLeft size={12} className="rotate-[-90deg] text-black" />
              </div>
            </div>
          </div>

          {/* EXTENDED CONTROLS */}
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useResultAsInput}
                onChange={(e) => setUseResultAsInput(e.target.checked)}
                className="w-4 h-4 accent-[#FF66C4]"
              />
              <span className={`text-xs font-bold font-logo lowercase ${useResultAsInput ? "text-[#FF66C4]" : "text-gray-500"}`}>
                {useResultAsInput ? "✨ Edit this result" : "✏️ Edit my drawing"}
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <textarea
            className="flex-1 bg-gray-100 border-2 border-black rounded-xl p-3 font-bold text-sm resize-none focus:outline-none focus:border-[#FF66C4] text-black"
            rows={2}
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
          />
          <Button
            onClick={handleRegenerate}
            className="bg-[#FF66C4] !text-black font-logo lowercase whitespace-nowrap h-auto self-center w-72"
            icon={<RotateCcw size={20} />}
          >
            Regenerate
          </Button>
        </div>

        {/* Credits Indicator - Click to Refill (Dev Cheat) */}
        <div className="mt-8 flex justify-center mb-8">
          <div
            onClick={() => {
              if (confirm("Dev Mode: Refill your credits? 🔋")) {
                setGenerationCount(0);
              }
            }}
            className="inline-flex items-center gap-2 bg-white border-2 border-black px-6 py-3 rounded-full shadow-[2px_2px_0_black] cursor-default select-none transition-transform hover:scale-105"
          >
            <Bell size={20} className="text-black fill-[#FFD93D]" />
            <span className="font-bold text-black text-sm font-logo lowercase tracking-wide">
              {MAX_GENERATIONS - generationCount} of {MAX_GENERATIONS} generations left
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center items-center py-8 px-8">
        <Button
          onClick={hasSaved ? handleOpenGallery : handleSaveToGallery}
          className={`w-72 whitespace-nowrap font-logo lowercase px-4 ${hasSaved ? 'bg-[#FFD93D] !text-black' : 'bg-[#4DE1C1] !text-black'}`}
          disabled={isSaving}
          variant={hasSaved ? 'success' : 'secondary'}
          icon={hasSaved ? <Images size={24} /> : <Save size={24} />}
        >
          {isSaving ? "Saving..." : hasSaved ? "Open Gallery" : "Save to Gallery"}
        </Button>
        <Button
          onClick={handleReset}
          variant="secondary"
          className="w-72 whitespace-nowrap bg-white !text-black border-2 border-black font-logo lowercase px-4"
          icon={<ArrowLeft size={24} />}
        >
          Start Over
        </Button>
      </div>
    </div>

  );

  const renderGallery = () => (
    <div className="flex flex-col min-h-screen bg-[#FFF9F0]">
      <div className="p-6 sticky top-0 bg-[#FFF9F0]/95 backdrop-blur-sm z-20 border-b-4 border-black flex items-center gap-4">
        <button
          onClick={() => setAppState(AppState.WELCOME)}
          className="p-3 bg-white rounded-full hand-border hand-shadow-sm hover:scale-105 transition-transform"
        >
          <ArrowLeft size={24} color="black" strokeWidth={3} />
        </button>
        <h2 className="text-4xl font-black text-[#1a1a1a] font-logo lowercase">My Gallery</h2>
        {result && (
          <Button
            onClick={() => setAppState(AppState.RESULT)}
            className="ml-auto bg-[#FF66C4] !text-black font-logo lowercase h-auto py-2 px-4 shadow-[2px_2px_0_black]"
            icon={<Wand2 size={20} />}
          >
            Resume Magic
          </Button>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {galleryItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center mt-12">
            <div className="bg-gray-200 p-8 rounded-full mb-6 hand-border border-dashed border-4 border-gray-400">
              <Images size={64} className="opacity-50 text-gray-500" />
            </div>
            <p className="text-2xl font-black text-gray-400 mb-2 font-logo lowercase">No drawings yet!</p>
            <p className="text-gray-500 mb-8 font-bold">Go make some magic!</p>
            <Button onClick={handleStart} variant="primary" icon={<Wand2 size={24} />} className="font-logo lowercase">
              Start Creating
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {galleryItems.map((item, index) => (
              <div key={item.id} className={`bg-white rounded-3xl overflow-hidden hand-border hand-shadow hover:hand-shadow-hover transition-all group ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                <div className="relative aspect-square border-b-4 border-black">
                  <img src={item.styledImage} alt="Art" className="w-full h-full object-cover" />

                  <div className="absolute top-3 right-3 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleResumeFromGallery(item)}
                      className="p-3 bg-white rounded-full hand-border hand-shadow-sm hover:scale-110 transition-transform"
                      title="Resume Magic"
                    >
                      <Wand2 size={20} color="#FF66C4" strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => handleShare(item.styledImage, item.styleId)}
                      className="p-3 bg-[#FFD93D] rounded-full hand-border hand-shadow-sm hover:scale-110 transition-transform"
                      title="Share"
                    >
                      <Share2 size={20} color="black" strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => handleDownload(item.styledImage, item.styleId)}
                      className="p-3 bg-[#4DE1C1] rounded-full hand-border hand-shadow-sm hover:scale-110 transition-transform"
                    >
                      <Download size={20} color="black" strokeWidth={3} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      className="p-3 bg-[#FF6B6B] rounded-full hand-border hand-shadow-sm hover:scale-110 transition-transform"
                    >
                      <Trash2 size={20} color="white" strokeWidth={3} />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 bg-[#1a1a1a] text-white text-xs font-bold px-3 py-1 rounded-lg hand-border shadow-[2px_2px_0_#FFF] font-logo lowercase">
                    {item.styleId} style
                  </div>
                </div>
                <div className="p-5 bg-white">
                  <p className="text-lg font-bold text-[#1a1a1a] leading-tight">"{item.message}"</p>
                  <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-wider">{new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {appState === AppState.WELCOME && renderWelcome()}
      {appState === AppState.CAMERA && renderCameraSelection()}
      {appState === AppState.LIVE_CAMERA && renderLiveCamera()}
      {appState === AppState.CONTEXT_INPUT && renderContextInput()}
      {appState === AppState.ANALYZING && renderAnalyzing()}
      {appState === AppState.STYLE_SELECT && renderStyleSelect()}
      {appState === AppState.PROCESSING && renderProcessing()}
      {appState === AppState.RESULT && renderResult()}
      {appState === AppState.GALLERY && renderGallery()}
    </>
  );
};

export default App;