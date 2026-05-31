"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, 
  Terminal, 
  Database, 
  Shield, 
  Globe, 
  LogOut, 
  Code, 
  User, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Play, 
  ExternalLink, 
  Activity,
  Sparkles,
  Server,
  Layers,
  Layout,
  Mic,
  Github,
  Upload,
  Image as ImageIcon,
  Search,
  BookOpen,
  Settings,
  Heart,
  MessageSquare,
  HelpCircle,
  Folder,
  X,
  CreditCard,
  Gift,
  CheckCircle,
  Copy,
  ChevronDown,
  Moon,
  Sun,
  Laptop
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface UserProfile {
  username: string;
  fullName: string;
  email: string;
}

interface SavedPrompt {
  id: string;
  prompt: string;
  type: string;
  colorTheme: string;
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasMongo, setHasMongo] = useState<boolean>(false);
  
  // Design system and Layout
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light" | "white">("dark");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false); // Collapsed by default as requested
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false); // Pop-up menu trigger
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState<boolean>(false); // State for the plus button pop-up
  const [greetingLang, setGreetingLang] = useState<"urdu" | "english">("english");
  const [activeModal, setActiveModal] = useState<
    null | "import-github" | "upload-computer" | "upload-screenshot" | "gift-success" | "auth-alert" | "doc-reader" | "projects-manager"
  >(null);
  
  // Workspace / Playground controls
  const [ideaPrompt, setIdeaPrompt] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [componentType, setComponentType] = useState<string>("landing");
  const [colorScheme, setColorScheme] = useState<string>("indigo-teal");
  const [generating, setGenerating] = useState<boolean>(false);
  const [currentMockup, setCurrentMockup] = useState<SavedPrompt | null>(null);
  const [savedItems, setSavedItems] = useState<SavedPrompt[]>([]);
  
  // Dropdowns inside sidebar
  const [isNewChatDropdownOpen, setIsNewChatDropdownOpen] = useState<boolean>(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);
  const [isRecentChatsOpen, setIsRecentChatsOpen] = useState<boolean>(true);
  
  // Microphone / Voice state simulation
  const [voiceRecording, setVoiceRecording] = useState<boolean>(false);
  const [voiceVolumeScale, setVoiceVolumeScale] = useState<number[]>([1, 1, 1, 1, 1]);
  
  // Gift Section Form inputs
  const [giftEmail, setGiftEmail] = useState<string>("");
  const [giftMessage, setGiftMessage] = useState<string>("");

  // Simulated content upload states
  const [githubUrl, setGithubUrl] = useState<string>("");
  const [tempFile, setTempFile] = useState<string>("");
  const [tempImageName, setTempImageName] = useState<string>("");

  // Sync state and check MongoDB configuration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser");
      
      // Check if user is authenticated, if not redirect to login
      if (!storedUser) {
        setActiveModal("auth-alert");
        return;
      }

      const savedMongo = localStorage.getItem("vC_mongo_uri");
      const savedTheme = localStorage.getItem("vC_theme") as "dark" | "light" | "white" | null;
      
      const localSaved = localStorage.getItem("vC_chats");
      const defaultPrompts: SavedPrompt[] = [];
      let parsedSaved = defaultPrompts;
      if (localSaved) {
        try {
          parsedSaved = JSON.parse(localSaved);
        } catch {}
      } else {
        localStorage.setItem("vC_chats", JSON.stringify(defaultPrompts));
      }

      let parsedUser: UserProfile | null = null;
      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser);
        } catch {
          localStorage.removeItem("currentUser");
          setActiveModal("auth-alert");
          return;
        }
      }

      setTimeout(() => {
        if (savedTheme) {
          setCurrentTheme(savedTheme);
        }
        setHasMongo(!!savedMongo || !!process.env.NEXT_PUBLIC_MONGODB_URI);
        setCurrentUser(parsedUser);
        setSavedItems(parsedSaved);
      }, 0);
    }
  }, []);

  // Sync theme switch with body class for high fidelity styling
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("vC_theme", currentTheme);
    }
  }, [currentTheme]);

  // Audio waveform animation simulation
  useEffect(() => {
    let timer: any;
    if (voiceRecording) {
      timer = setInterval(() => {
        setVoiceVolumeScale(Array.from({ length: 5 }, () => Math.random() * 80 + 20));
      }, 150);
    } else {
      setTimeout(() => {
        setVoiceVolumeScale([20, 20, 20, 20, 20]);
      }, 0);
    }
    return () => clearInterval(timer);
  }, [voiceRecording]);

  // Sync handler across windows
  useEffect(() => {
    const handleSync = () => {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      } else {
        setCurrentUser(null);
      }
      const savedMongo = localStorage.getItem("vC_mongo_uri");
      setHasMongo(!!savedMongo);
    };

    window.addEventListener("credentialsUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("credentialsUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
      setIsProfileOpen(false);
      
      const event = new Event("credentialsUpdated");
      window.dispatchEvent(event);
      router.push("/");
    }
  };

  const handleStartBuild = (explicitPrompt?: string) => {
    const activeText = explicitPrompt || ideaPrompt;
    if (!activeText.trim()) return;

    if (!currentUser) {
      setActiveModal("auth-alert");
    } else {
      localStorage.setItem("vC_initial_prompt", activeText);
      
      const newItem: SavedPrompt = {
        id: Date.now().toString(),
        prompt: activeText,
        type: "Custom Component",
        colorTheme: "indigo-teal",
        createdAt: new Date().toLocaleDateString()
      };
      
      const updated = [newItem, ...savedItems];
      setSavedItems(updated);
      localStorage.setItem("vC_chats", JSON.stringify(updated));
      
      router.push("/editor");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleStartBuild();
    }
  };

  const deleteSavedItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedItems.filter(item => item.id !== id);
    setSavedItems(filtered);
    localStorage.setItem("vC_chats", JSON.stringify(filtered));
    if (currentMockup && currentMockup.id === id) {
      setCurrentMockup(null);
    }
  };

  const getGradientClass = (scheme: string) => {
    switch (scheme) {
      case "rose-purple":
        return "from-rose-500 to-purple-600";
      case "emerald-teal":
        return "from-emerald-400 to-teal-600";
      case "cyan-blue":
        return "from-cyan-400 to-blue-600";
      case "amber-orange":
        return "from-amber-400 to-orange-600";
      default:
        return "from-teal-400 to-indigo-500";
    }
  };

  // Smooth scroll helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSendGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftEmail) return;
    setActiveModal("gift-success");
  };

  const handlePlusClick = () => {
    if (!currentUser) {
      setActiveModal("auth-alert");
    } else {
      setIsSidebarExpanded(true);
      setIsNewChatDropdownOpen(true);
    }
  };

  const startVoiceInput = () => {
    if (voiceRecording) {
      setVoiceRecording(false);
      setIdeaPrompt("Automated Speech Transcript: Dynamic dashboard featuring live streaming metrics and canvas controller.");
    } else {
      setVoiceRecording(true);
    }
  };

  const filteredSavedItems = savedItems.filter(item => 
    item.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTheme = () => {
    if (currentTheme === "dark") {
      setCurrentTheme("light");
    } else if (currentTheme === "light") {
      setCurrentTheme("white");
    } else {
      setCurrentTheme("dark");
    }
  };

  // Dynamic Theme-based background styling
  const themeClasses = {
    dark: {
      body: "bg-[#05060f] text-slate-100",
      mainBg: "bg-[#05060f]",
      topNavbar: "bg-[#05060f]/95 border-b border-white/[0.04] text-white",
      sidebar: "bg-[#070914] border-r border-white/[0.03] text-white",
      card: "bg-[#0a0d1b] border border-white/[0.04] text-white shadow-2xl",
      cardInner: "bg-[#04060d] text-slate-300 border-slate-900/60",
      input: "bg-[#03040b] text-white border-slate-900 placeholder-slate-655 focus:border-amber-400/40",
      accentText: "text-amber-400",
      mutedText: "text-slate-400",
      borderMuted: "border-slate-900/80",
    },
    light: {
      body: "bg-slate-50 text-slate-850",
      mainBg: "bg-slate-50",
      topNavbar: "bg-white/95 border-b border-slate-200 text-slate-900 shadow-sm",
      sidebar: "bg-slate-100 border-r border-slate-200 text-slate-800",
      card: "bg-white border border-slate-200/80 shadow-md shadow-slate-200/30 text-slate-800",
      cardInner: "bg-slate-100/50 text-slate-600 border-slate-200",
      input: "bg-white text-slate-900 border-slate-200 placeholder-slate-400 focus:border-indigo-400/40",
      accentText: "text-indigo-600 font-bold",
      mutedText: "text-slate-500",
      borderMuted: "border-slate-200",
    },
    white: {
      body: "bg-white text-slate-900",
      mainBg: "bg-white",
      topNavbar: "bg-white border-b border-slate-250 text-slate-950 shadow-md",
      sidebar: "bg-slate-50 border-r border-slate-205 text-slate-900",
      card: "bg-white border border-slate-300 shadow-lg text-slate-950",
      cardInner: "bg-slate-50 text-slate-750 border-slate-200",
      input: "bg-white text-slate-950 border-slate-350 placeholder-slate-500 focus:border-teal-605",
      accentText: "text-teal-600 font-bold",
      mutedText: "text-slate-600",
      borderMuted: "border-slate-300",
    }
  };

  const tc = themeClasses[currentTheme];

  return (
    <div className={`h-screen flex flex-col relative transition-colors duration-200 overflow-hidden ${tc.body}`} id="main-root-workspace">
      
      {/* ========================================================
         MODALS POP-UPS (GitHub, Computer upload, Screenshot info)
         ======================================================== */}
      <AnimatePresence>
        
        {/* Auth alert modal requested for + button */}
        {activeModal === "auth-alert" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0f1d] border border-red-500/30 max-w-md w-full rounded-2xl p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-md font-bold text-white">Authentication State Mandatory</h3>
              </div>

              {/* Exact Message requirement */}
              <p className="text-xs text-slate-350 leading-relaxed font-sans">
                Please create an account or login to start building your creative custom parameters on the console dashboard. Sandbox environments reside under isolated authorization rules.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    router.push("/login");
                  }}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-xs font-semibold py-2 rounded-xl cursor-pointer text-center"
                >
                  Log In Portal
                </button>
                <button
                  onClick={() => {
                    setActiveModal(null);
                    router.push("/signup");
                  }}
                  className="bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-950 text-xs font-bold py-2 rounded-xl cursor-pointer text-center"
                >
                  Create Secure Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* GitHub Import Modal */}
        {activeModal === "import-github" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0f1d] border border-teal-500/30 max-w-md w-full rounded-2xl p-6 shadow-2xl relative"
            >
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-405 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <Github className="w-6 h-6 text-teal-400" />
                <h3 className="text-md font-bold text-white">Import from GitHub</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Sync metadata dynamically directly from a remote GitHub repository.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">REPOSITORY URL</label>
                  <input
                    type="text"
                    placeholder="https://github.com/username/project"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-[#050811] text-xs border border-slate-800 rounded-lg p-2 focus:border-teal-400 focus:outline-none text-white font-mono"
                  />
                </div>
                <button
                  onClick={() => {
                    handleStartBuild(`GitHub Project: ${githubUrl || "vCreative-custom-component"}`);
                    setActiveModal(null);
                  }}
                  className="w-full bg-teal-400 text-slate-950 font-bold text-xs py-2 rounded-lg"
                >
                  Sync & Generate Sandbox Mockup
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Upload from Computer modal */}
        {activeModal === "upload-computer" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0f1d] border border-indigo-500/30 max-w-md w-full rounded-2xl p-6 shadow-2xl relative"
            >
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-6 h-6 text-indigo-400" />
                <h3 className="text-md font-bold text-white">Upload from Computer</h3>
              </div>
              <p className="text-xs text-slate-450 mb-4">
                Drag-and-drop structural files from client devices into our compiler.
              </p>
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-400/50 rounded-xl p-8 text-center cursor-pointer space-y-2">
                <Upload className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">Select code files (.tsx, .css, .json)</p>
                <p className="text-[10px] text-slate-500">Max file sizes: 12MB</p>
              </div>
              <div className="mt-4">
                <input 
                  type="text" 
                  placeholder="Or provide path locally..."
                  value={tempFile}
                  onChange={(e) => setTempFile(e.target.value)}
                  className="w-full bg-[#050811] text-xs border border-slate-800 rounded-lg p-2 font-mono text-white focus:border-indigo-405 focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  handleStartBuild(`Local Client Assets File: ${tempFile || "config-layout.json"}`);
                  setActiveModal(null);
                }}
                className="w-full bg-indigo-550 bg-indigo-500 text-white font-bold text-xs py-2 rounded-lg mt-4"
              >
                Compile Uploaded Assets
              </button>
            </motion.div>
          </div>
        )}

        {/* Upload screenshot mockup modal */}
        {activeModal === "upload-screenshot" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0f1d] border border-cyan-500/30 max-w-md w-full rounded-2xl p-6 shadow-2xl relative"
            >
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="w-6 h-6 text-cyan-400" />
                <h3 className="text-md font-bold text-white">Upload Screenshot Layout</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Translate physical whiteboard doodles or client UI screens into high fidelity React code.
              </p>
              <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center cursor-pointer space-y-2">
                <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-350">Drag image screenshot here</p>
              </div>
              <div className="mt-4">
                <input 
                  type="text" 
                  placeholder="Screenshot design name parameters..."
                  value={tempImageName}
                  onChange={(e) => setTempImageName(e.target.value)}
                  className="w-full bg-[#050811] text-xs border border-slate-800 rounded-lg p-2 focus:border-cyan-455 text-white focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  handleStartBuild(`AI Layout from screenshot: ${tempImageName || "analytics-overview-screenshot.png"}`);
                  setActiveModal(null);
                }}
                className="w-full bg-cyan-500 hover:bg-cyan-600/90 text-slate-950 font-bold text-xs py-2 rounded-lg mt-4"
              >
                Assemble Screen Elements
              </button>
            </motion.div>
          </div>
        )}

        {/* Gift success overlay */}
        {activeModal === "gift-success" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0f1d] border border-teal-500/40 max-w-sm w-full rounded-2xl p-6 text-center space-y-4 shadow-2xl relative"
            >
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center text-teal-400 mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-md font-bold text-white">Gift Voucher Transmitted!</h3>
              <p className="text-xs text-slate-400">
                A private, pre-compiled upgrade voucher has been dispatched to <span className="text-teal-400 font-mono text-[11px] font-bold">{giftEmail}</span> with your message. Let&apos;s make customization frictionless.
              </p>
              <button
                onClick={() => {
                  setGiftEmail("");
                  setGiftMessage("");
                  setActiveModal(null);
                }}
                className="bg-teal-400 hover:bg-teal-500 text-slate-950 text-xs font-bold px-6 py-2 rounded-xl cursor-pointer"
              >
                Acknowledge & Dismiss
              </button>
            </motion.div>
          </div>
        )}

        {/* Doc documentation manual modal */}
        {activeModal === "doc-reader" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-[#070a14] border border-slate-800 max-w-2xl w-full rounded-3xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar"
            >
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-4">
                <BookOpen className="w-5 h-5 text-teal-400" />
                <h3 className="text-md font-bold text-white">vCreative Operational Manual</h3>
              </div>
              <div className="space-y-4 text-xs text-slate-350 leading-relaxed font-sans">
                <p className="font-bold text-teal-300">1. Private Client Containers</p>
                <p>Every profile created is authorized locally inside our client layer container, mapping specific storage schema variables on localized index state records.</p>
                
                <p className="font-bold text-teal-300">2. Realtime Build Triggers</p>
                <p>Enter any parameters prompt description to compile virtual visual mockups on-the-fly. The compiler outputs fully standard compliance CSS styled structures.</p>

                <p className="font-bold text-indigo-400">3. Setting Custom Themes</p>
                <p>Switch themes dynamically using the Top-Nav controls choice: Light, Dark, or pure Stark White high-contrast format.</p>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>

      {/* ========================================================
         TOP NAVIGATION HEADER
         ======================================================== */}
      <header 
        className={`sticky top-0 z-40 w-full backdrop-blur-md px-4 py-3 border-b flex items-center justify-between transition-colors duration-200 ${tc.topNavbar}`}
        id="top-main-navbar"
      >
        <div className="flex items-center space-x-6">
          {/* Logo Group */}
          <div 
            onClick={() => router.push("/")}
            className="flex items-center space-x-2 cursor-pointer group"
            id="logo-group-link"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 via-rose-400 to-violet-500 flex items-center justify-center text-slate-950 font-black tracking-tight text-xs">
              vC
            </div>
            <span className="font-bold text-lg tracking-tight hover:opacity-85 transition-opacity">
              VVCV <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-violet-400 font-extrabold">Creative</span>
            </span>
          </div>
        </div>

        {/* Centered navigation items for both logged-in and logged-out state with Sunset Amber theme */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-400" id="desktop-links">
          <button onClick={() => scrollToSection("features")} className="hover:text-amber-400 cursor-pointer transition-colors text-xs font-bold tracking-wide">Features</button>
          <button onClick={() => scrollToSection("templates")} className="hover:text-amber-400 cursor-pointer transition-colors text-xs font-bold tracking-wide">Templates</button>
          <button onClick={() => scrollToSection("about")} className="hover:text-amber-400 cursor-pointer transition-colors text-xs font-bold tracking-wide">About Us</button>
          <button onClick={() => scrollToSection("pricing")} className="hover:text-amber-400 cursor-pointer transition-colors text-xs font-bold tracking-wide">Pricing Plan</button>
        </nav>

        <div className="flex items-center space-x-4">
          {/* Always show exactly one theme toggle icon */}
          <button
            onClick={toggleTheme}
            className="p-2 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/40 transition-all cursor-pointer border border-transparent"
            title={`Toggle Theme (Current: ${currentTheme.toUpperCase()})`}
            id="header-theme-toggle"
          >
            {currentTheme === "dark" ? (
              <Moon className="w-4 h-4 text-violet-400" />
            ) : currentTheme === "light" ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Laptop className="w-4 h-4 text-rose-500" />
            )}
          </button>

          {!currentUser && (
            <div className="flex items-center space-x-3" id="unsigned-actions-root">
              <button 
                onClick={() => router.push("/login")}
                className="text-slate-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer"
                id="header-login-btn"
              >
                Log In
              </button>
              <button 
                onClick={() => router.push("/signup")}
                className="bg-gradient-to-r from-amber-400 via-rose-450 via-rose-400 to-violet-500 text-slate-950 hover:opacity-[0.93] text-xs px-4.5 py-2.5 rounded-xl font-extrabold tracking-wide cursor-pointer transition-all active:scale-[0.98] shadow-md shadow-amber-500/10"
                id="header-signup-btn"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex relative overflow-hidden" id="main-workspace-container">
        
        {/* ========================================================
           SIDEBAR NAVIGATION (ONLY SHOWN TO LOGGED IN USERS)
           ======================================================== */}
        <AnimatePresence>
          {currentUser && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: isSidebarExpanded ? 260 : 72, 
                opacity: 1 
              }}
              exit={{ width: 0, opacity: 0 }}
              className={`hidden md:flex flex-col border-r h-[calc(100vh-65px)] sticky top-[65px] overflow-hidden z-30 justify-between shrink-0 transition-all ${tc.sidebar}`}
              id="sidebar-navigation-bar"
            >
              <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-4">
                
                {/* 1) Branding Node inside side nav bar */}
                <div className="flex items-center justify-between border-b border-white/[0.03] pb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-7 h-7 rounded bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Code className="w-4 h-4 text-amber-400" />
                    </div>
                    {isSidebarExpanded && (
                      <span className="text-xs font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-violet-400 truncate">
                        VVCV Creative
                      </span>
                    )}
                  </div>
                  {/* Expand collapsibility state button */}
                  <button 
                    onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
                    title={isSidebarExpanded ? "Collapse View Map" : "Expand View Map"}
                  >
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSidebarExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {/* 2) Start New Chat with dropdown inside Sidebar */}
                <div className="relative">
                  <button
                    onClick={() => setIsNewChatDropdownOpen(!isNewChatDropdownOpen)}
                    className="w-full bg-gradient-to-r from-teal-400/20 to-indigo-500/20 text-teal-300 hover:from-teal-400/30 hover:to-indigo-500/30 border border-teal-500/30 p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-1.5 transition-colors overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Plus className="w-4 h-4 text-teal-400 shrink-0" />
                      {isSidebarExpanded && <span className="truncate">New Chat</span>}
                    </div>
                    {isSidebarExpanded && <ChevronDown className="w-3.5 h-3.5 text-slate-450 shrink-0" />}
                  </button>

                  <AnimatePresence>
                    {isNewChatDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute left-0 right-0 mt-1.5 bg-[#090e1b] border border-slate-800 rounded-xl p-1 z-40 shadow-xl space-y-0.5"
                      >
                        <button
                          onClick={() => {
                            setIsNewChatDropdownOpen(false);
                            setActiveModal("import-github");
                          }}
                          className="w-full text-left px-3 py-2 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-900/40 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <Github className="w-3.5 h-3.5 text-teal-400" />
                          <span>Import New Chat</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsNewChatDropdownOpen(false);
                            scrollToSection("templates");
                          }}
                          className="w-full text-left px-3 py-2 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-900/40 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Start from Template</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3) Sleek Search Bar */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-550" />
                  <input
                    type="text"
                    placeholder={isSidebarExpanded ? "Filter dynamic prompts..." : "Search..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#050811] text-xs pl-8 pr-2.5 py-2.5 rounded-xl text-white placeholder-slate-700 border border-slate-900 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                {/* 4) Navigation Menu Action Buttons */}
                <nav className="space-y-1">
                  
                  {/* Home Button */}
                  <button 
                    onClick={() => router.push("/")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-teal-400 bg-teal-500/5 border border-teal-500/10 cursor-pointer"
                  >
                    <Layout className="w-4 h-4 text-teal-400 shrink-0" />
                    {isSidebarExpanded && <span>Home Playground</span>}
                  </button>

                  {/* Projects Button */}
                  <button 
                    onClick={() => setActiveModal("projects-manager")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900/50 cursor-pointer transition-all"
                  >
                    <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                    {isSidebarExpanded && <span>Projects Manager</span>}
                  </button>

                  {/* Chats Button */}
                  <button 
                    onClick={() => scrollToSection("landing-bento-highlights")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900/50 cursor-pointer transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                    {isSidebarExpanded && <span>Chats Logs</span>}
                  </button>

                  {/* Templates Button */}
                  <button 
                    onClick={() => scrollToSection("templates")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900/50 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    {isSidebarExpanded && <span>Templates Preset</span>}
                  </button>

                </nav>

                {/* 5) Favorites Dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
                    className="w-full flex items-center justify-between text-slate-500 hover:text-slate-300 py-1.5 px-2 text-[10px] font-mono tracking-wider uppercase font-semibold"
                  >
                    <div className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      {isSidebarExpanded && <span>Favorites</span>}
                    </div>
                    {isSidebarExpanded && <ChevronRight className={`w-3 h-3 transition-transform ${isFavoritesOpen ? "rotate-90" : ""}`} />}
                  </button>
                  
                  {isFavoritesOpen && isSidebarExpanded && (
                    <motion.div className="pl-3.5 space-y-1 text-slate-400 text-[11px]">
                      <p className="hover:text-teal-400 cursor-pointer truncate">• React Audio Instrument</p>
                      <p className="hover:text-teal-400 cursor-pointer truncate">• SaaS Performance Panel</p>
                    </motion.div>
                  )}
                </div>

                {/* 6) Recent Chats Dropdown */}
                <div className="space-y-1">
                  <button
                    onClick={() => setIsRecentChatsOpen(!isRecentChatsOpen)}
                    className="w-full flex items-center justify-between text-slate-500 hover:text-slate-300 py-1.5 px-2 text-[10px] font-mono tracking-wider uppercase font-semibold"
                  >
                    <div className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-teal-400" />
                      {isSidebarExpanded && <span>Recent Chats</span>}
                    </div>
                    {isSidebarExpanded && <ChevronRight className={`w-3 h-3 transition-transform ${isRecentChatsOpen ? "rotate-90" : ""}`} />}
                  </button>
                  
                  {isRecentChatsOpen && isSidebarExpanded && (
                    <motion.div className="pl-3.5 space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar">
                      {filteredSavedItems.slice(0, 5).map((item) => (
                        <p 
                          key={item.id} 
                          onClick={() => {
                            setCurrentMockup(item);
                            scrollToSection("live-mockup-canvas");
                          }}
                          className="hover:text-teal-400 cursor-pointer truncate text-[11px] text-slate-400 font-mono py-0.5"
                        >
                          • {item.prompt}
                        </p>
                      ))}
                    </motion.div>
                  )}
                </div>

              </div>

              {/* 7) Bottom Profile area + Pop-Up trigger */}
              <div className="p-3 border-t border-white/[0.03] space-y-2">
                <div className="relative">
                  
                  {/* Clickable user box triggers Pop-up menu */}
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-full flex items-center space-x-2.5 p-2 rounded-xl bg-slate-900/30 hover:bg-slate-900/70 border border-transparent hover:border-slate-800 text-left transition-all cursor-pointer"
                    id="sidebar-avatar-trigger"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-slate-900 uppercase shrink-0">
                      {currentUser.username ? currentUser.username.substring(0, 2) : "CL"}
                    </div>
                    {isSidebarExpanded && (
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">@{currentUser.username}</p>
                      </div>
                    )}
                  </button>

                  {/* 8) Integrated Pop-Up Menu (Personalization, Profile, Language change, Sign Out, Docs) */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute bottom-14 left-0 w-64 bg-[#090e1b] border border-slate-900 rounded-2xl p-4 shadow-2xl z-50 text-left space-y-4 font-sans"
                        id="profile-popup-menu"
                      >
                        {/* A) Profile Detail */}
                        <div className="border-b border-white/[0.04] pb-3 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-violet-500 flex items-center justify-center text-slate-950 font-extrabold text-xs shrink-0">
                            {currentUser.username ? currentUser.username.substring(0, 2).toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{currentUser.fullName}</h4>
                            <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                          </div>
                        </div>

                        {/* B) Workspaces Sync Status Selector */}
                        <div className="space-y-1.5">
                          <p className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Active Workspace</p>
                          <button
                            onClick={() => setHasMongo(!hasMongo)}
                            className="w-full text-left py-1.5 px-2 rounded-lg text-xs text-slate-350 hover:text-white bg-[#03040b] border border-slate-900 hover:border-slate-800 flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <span className="flex items-center gap-1.5 text-[10px] tracking-wide">
                              <Server className="w-3.5 h-3.5 text-amber-450 text-amber-400" />
                              <span>WS: {hasMongo ? "MongoDB Cluster" : "Local Browser"}</span>
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          </button>
                        </div>

                        {/* C) Language Dropdown Selection */}
                        <div className="space-y-1.5">
                          <p className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Language Preference</p>
                          <div className="relative">
                            <select
                              value={greetingLang}
                              onChange={(e) => setGreetingLang(e.target.value as "english" | "urdu")}
                              className="w-full bg-[#03040b] border border-slate-900 focus:border-amber-400/40 rounded-lg px-2 py-1.5 text-[11px] text-slate-350 focus:outline-none cursor-pointer"
                            >
                              <option value="english">英語 - English Translation</option>
                              <option value="urdu">اردو - Urdu Translation</option>
                            </select>
                          </div>
                        </div>

                        {/* D) Theme selector (Personalization) */}
                        <div className="space-y-1.5">
                          <p className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Theme Personalization</p>
                          <div className="grid grid-cols-3 bg-[#03040b] rounded-lg p-0.5 border border-slate-900">
                            <button
                              type="button"
                              onClick={() => setCurrentTheme("dark")}
                              className={`text-[9px] font-semibold py-1 rounded transition-all text-center cursor-pointer ${
                                currentTheme === "dark" ? "bg-amber-450 text-slate-950 font-bold bg-amber-400" : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              Dark
                            </button>
                            <button
                              type="button"
                              onClick={() => setCurrentTheme("light")}
                              className={`text-[9px] font-semibold py-1 rounded transition-all text-center cursor-pointer ${
                                currentTheme === "light" ? "bg-amber-450 text-slate-950 font-bold bg-amber-400" : "text-slate-405 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              Light
                            </button>
                            <button
                              type="button"
                              onClick={() => setCurrentTheme("white")}
                              className={`text-[9px] font-semibold py-1 rounded transition-all text-center cursor-pointer ${
                                currentTheme === "white" ? "bg-amber-450 text-slate-950 font-bold bg-amber-400" : "text-slate-405 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              White
                            </button>
                          </div>
                        </div>

                        {/* E) Navigation Manual Docs & Log Out */}
                        <div className="space-y-1 border-t border-white/[0.04] pt-2.5">
                          <button
                            onClick={() => {
                              setIsProfileOpen(false);
                              setActiveModal("doc-reader");
                            }}
                            className="w-full text-left py-1.5 px-2 rounded-lg text-[10px] text-slate-300 hover:text-white hover:bg-slate-900/60 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                            <span>Workspace Manual Docs</span>
                          </button>
                          
                          <button
                            onClick={handleLogout}
                            className="w-full text-left py-1.5 px-2 rounded-lg text-[10px] font-bold text-rose-450 hover:text-rose-400 hover:bg-rose-950/15 flex items-center gap-1.5 cursor-pointer transition-colors border border-transparent hover:border-rose-950/30"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out Profile</span>
                          </button>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </div>

            </motion.aside>
          )}
        </AnimatePresence>

        {/* ========================================================
           MAIN VIEW CONTENT CANVAS AREA
           ======================================================== */}
        <main className={`flex-1 flex flex-col min-w-0 transition-colors duration-250 relative overflow-y-auto custom-scrollbar ${tc.mainBg}`} id="core-view-section">
          
          {/* Accent lighting drops */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-[20%] right-10 w-96 h-96 bg-indigo-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
          
          {/* ========================================================
             UNIFIED LANDING PLAYGROUND PAGE
             ======================================================== */}
          <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-20 text-center max-w-5xl mx-auto space-y-12">
            
            {/* Promo tags */}
            <div className="inline-flex items-center gap-1.5 bg-[#0a0f1d] border border-slate-800 rounded-full px-4 py-1.5 animate-pulse-slow">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-spin-slow" />
              <span className="text-[10px] font-mono text-slate-405 tracking-wider uppercase font-semibold">
                Secure Creative Sandbox Environment v2
              </span>
            </div>

            {/* Main Landing display Tagline written in the middle */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium text-white tracking-tight leading-[1.1] font-sans">
                Instantiate, Share & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400 font-extrabold pb-1.5 block md:inline">
                  Deploy Creative Code Component!
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans">
                Welcome to vCreative, the ultimate developer playground and prompt builder console. Set up your secure profile, access local encrypted buffers, or connect MongoDB to sync metadata dynamically today.
              </p>
            </div>

            {/* Intelligent Tagline Text-box with unified sandbox action states */}
            <div 
              className={`w-full max-w-2xl text-left rounded-3xl p-5 shadow-2xl relative z-10 border transition-all ${
                currentTheme === 'light' 
                  ? 'bg-slate-50 border-slate-200 shadow-slate-200/50' 
                  : currentTheme === 'white' 
                    ? 'bg-white border-slate-200 shadow-slate-100/50' 
                    : 'bg-[#090d19] border-slate-800 shadow-black/80'
              }`} 
              id="guest-tagline-sandbox"
            >
              <div className="flex items-center justify-between border-b border-slate-900 pb-3 text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase">
                  <Terminal className="w-3.5 h-3.5 text-rose-500" />
                  <span>vCreative Sandbox Compiler</span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 text-amber-500 font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    {currentUser ? "SECURE CLIENT CONSOLE" : "ANONYMOUS READER ONLY"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 pt-1">
                <textarea
                  value={ideaPrompt}
                  onChange={(e) => setIdeaPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe custom elements, SaaS analytics, layout wireframes or start typing to build..."
                  className="w-full bg-transparent text-xs text-slate-250 placeholder-slate-600 focus:outline-none min-h-[90px] resize-none font-mono leading-relaxed"
                />

                {/* Active Recording Waveform Visuals */}
                {voiceRecording && (
                  <div className="flex items-center justify-center gap-1.5 py-2.5 bg-red-500/5 border border-red-500/20 rounded-xl">
                    {voiceVolumeScale.map((val, idx) => (
                      <div 
                        key={idx} 
                        className="w-1.5 bg-red-400 rounded transition-all duration-150 animate-pulse" 
                        style={{ height: `${Math.max(4, val / 3.5)}px` }} 
                      />
                    ))}
                    <span className="text-[10px] text-red-350 font-mono ml-2 font-semibold">Listening to speech signals...</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3.5 border-t border-slate-900">
                  <div className="flex items-center gap-2">
                    {/* Start Build Project Button */}
                    <button
                      onClick={() => handleStartBuild()}
                      className="bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-500 hover:opacity-95 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all text-xs shadow-md font-sans shadow-teal-500/10"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Start Build</span>
                    </button>

                    {/* Microphone icon next to Start Build */}
                    <button
                      onClick={startVoiceInput}
                      className={`p-2.5 rounded-xl cursor-pointer transition-colors border ${
                        voiceRecording 
                          ? "bg-red-500/20 text-red-405 border-red-500/30" 
                          : "bg-slate-900 hover:bg-slate-850 hover:text-white border-transparent text-slate-400"
                      }`}
                      title="Voice Input Command"
                    >
                      <Mic className="w-4 h-4 font-bold" />
                    </button>
                  </div>

                  {/* Plus button + Custom Pop-over overlay on right side */}
                  <div className="relative font-sans">
                    <button
                      onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isPlusMenuOpen ? "bg-amber-400 text-slate-950 border-amber-400" : "bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-400 border-slate-800"
                      }`}
                      title="Integrate Assets"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {isPlusMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 bottom-12 w-60 rounded-xl bg-[#090e1b] border border-slate-900 p-2 shadow-2xl z-50 text-left space-y-1"
                        >
                          <div className="px-2 py-1.5 border-b border-white/[0.03] mb-1">
                            <p className="text-[8px] font-mono uppercase tracking-wider text-slate-500 font-sans">Integrate Assets</p>
                          </div>
                          <button
                            onClick={() => {
                              setIsPlusMenuOpen(false);
                              if (!currentUser) {
                                setActiveModal("auth-alert");
                              } else {
                                setActiveModal("import-github");
                              }
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-350 hover:text-white hover:bg-slate-900/60 transition-colors cursor-pointer"
                          >
                            <Github className="w-4 h-4 text-teal-450 text-teal-400" />
                            <div className="text-left font-sans">
                              <p className="font-bold text-[11px] text-white">Import GitHub Repository</p>
                              <p className="text-[9px] text-slate-500">Connect Git branch assets</p>
                            </div>
                          </button>
                          <button
                            onClick={() => {
                              setIsPlusMenuOpen(false);
                              if (!currentUser) {
                                setActiveModal("auth-alert");
                              } else {
                                setActiveModal("upload-computer");
                              }
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-[#afbacc] hover:text-white hover:bg-slate-900/60 transition-colors cursor-pointer"
                          >
                            <Upload className="w-4 h-4 text-indigo-400" />
                            <div className="text-left font-sans">
                              <p className="font-bold text-[11px] text-white">Upload from Computer</p>
                              <p className="text-[9px] text-slate-500">Drop static asset bundles</p>
                            </div>
                          </button>
                          <button
                            onClick={() => {
                              setIsPlusMenuOpen(false);
                              if (!currentUser) {
                                setActiveModal("auth-alert");
                              } else {
                                setActiveModal("upload-screenshot");
                              }
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-[#afbacc] hover:text-white hover:bg-slate-900/60 transition-colors cursor-pointer"
                          >
                            <ImageIcon className="w-4 h-4 text-cyan-405" />
                            <div className="text-left font-sans">
                              <p className="font-bold text-[11px] text-white">Upload Screenshot</p>
                              <p className="text-[9px] text-slate-500">Convert wireframes directly</p>
                            </div>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              </div>
            </div>

            {/* Major CTAs shown ONLY when NOT logged in */}
            {!currentUser ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => router.push("/signup")}
                  className="w-full sm:w-auto bg-gradient-to-r from-teal-400 to-indigo-500 hover:opacity-90 text-slate-950 font-bold px-8 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-transform cursor-pointer shadow-lg shadow-teal-500/10 hover:shadow-indigo-500/10"
                >
                  <span>Build Secure Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => router.push("/login")}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 text-slate-200 px-8 py-3.5 rounded-xl text-sm font-semibold border border-slate-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Access Login Portal</span>
                </button>
              </div>
            ) : (
              <div className="text-center">
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-teal-500/20 rounded-full px-5 py-2 text-xs text-slate-300 font-medium">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span>Instant sandbox workspace compilation active on Port 3000</span>
                </span>
              </div>
            )}

            <div className="h-10" />

            {/* ========================================================
               SCROLLABLE GUEST VALUE SECTIONS
               ======================================================== */}

            {/* 1) FEATURES SECTION - PREMIUM REDESIGN */}
            <section id="features" className="w-full pt-20 border-t border-slate-900/60 text-left space-y-10">
              <div className="space-y-3 text-center">
                <span className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-mono uppercase tracking-widest px-4 py-1.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> Platform Capabilities
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Everything You Need to Build Faster</h3>
                <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  vCreative combines powerful sandboxing, real-time compilation, and encrypted storage into one seamless developer workspace.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* Feature 1 */}
                <div className="group bg-gradient-to-br from-[#0a0f1d] to-[#070c18] p-6 rounded-2xl border border-slate-900 hover:border-teal-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-colors">
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono text-teal-400 uppercase tracking-widest bg-teal-500/5 border border-teal-500/10 px-2 py-0.5 rounded">Security</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white">Encrypted Sandbox Isolation</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Every session runs in a fully isolated virtual container. Your code, prompts, and data remain private and never shared across sessions.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-teal-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> AES-256 encrypted buffers
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="group bg-gradient-to-br from-[#0a0f1d] to-[#070c18] p-6 rounded-2xl border border-slate-900 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded">Compiler</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white">Real-Time Build Engine</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Describe your UI and watch it compile instantly. Our webpack-powered engine generates production-ready React code in milliseconds.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Next.js 14 optimized output
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="group bg-gradient-to-br from-[#0a0f1d] to-[#070c18] p-6 rounded-2xl border border-slate-900 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                      <Database className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-500/5 border border-cyan-500/10 px-2 py-0.5 rounded">Storage</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white">MongoDB Cloud Sync</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Connect your own MongoDB cluster to persist projects, prompts, and templates across devices with zero configuration overhead.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> One-click cluster connection
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="group bg-gradient-to-br from-[#0a0f1d] to-[#070c18] p-6 rounded-2xl border border-slate-900 hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/20 transition-colors">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono text-violet-400 uppercase tracking-widest bg-violet-500/5 border border-violet-500/10 px-2 py-0.5 rounded">i18n</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white">Urdu &amp; English Interface</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Switch the entire workspace language between English and Urdu. First-ever fully localized developer sandbox for South Asian developers.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-violet-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> اردو / English toggle
                  </div>
                </div>

                {/* Feature 5 */}
                <div className="group bg-gradient-to-br from-[#0a0f1d] to-[#070c18] p-6 rounded-2xl border border-slate-900 hover:border-rose-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-rose-500/20 transition-colors">
                      <Mic className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest bg-rose-500/5 border border-rose-500/10 px-2 py-0.5 rounded">Voice AI</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white">Voice-to-Code Input</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Describe your UI using your voice. Our speech engine transcribes and converts spoken design intent directly into compilable component prompts.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Whisper-powered recognition
                  </div>
                </div>

                {/* Feature 6 */}
                <div className="group bg-gradient-to-br from-[#0a0f1d] to-[#070c18] p-6 rounded-2xl border border-slate-900 hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded">Templates</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white">Prebuilt Template Library</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Jump-start any project with our growing library of 8+ production-grade templates covering SaaS dashboards, landing pages, and e-commerce flows.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> 8+ ready-to-deploy presets
                  </div>
                </div>

              </div>
            </section>

            {/* 2) TEMPLATES CATALOGS SECTION - PREMIUM REDESIGN */}
            <section id="templates" className="w-full pt-20 text-left space-y-10">
              <div className="space-y-3 text-center">
                <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono uppercase tracking-widest px-4 py-1.5 rounded-full">
                  <Layout className="w-3 h-3" /> Precompiled Templates
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Launch with Premium Starter Templates</h3>
                <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  Pick a production-ready template, customize via prompt, and ship your UI in minutes — not hours.
                </p>
              </div>

              {/* Row 1 - 4 Templates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    id: "TPL-01",
                    title: "SaaS Landing Page",
                    desc: "Hero section, feature grid, CTA blocks, and footer. Fully responsive with dark/light toggle support.",
                    tag: "Landing",
                    color: "teal",
                    gradient: "from-teal-400 to-indigo-500",
                    icon: "🚀",
                    badge: "Most Popular"
                  },
                  {
                    id: "TPL-02",
                    title: "Analytics Dashboard",
                    desc: "Live metrics panels, chart grid, sidebar nav, and dark stat cards optimized for data-heavy products.",
                    tag: "Dashboard",
                    color: "indigo",
                    gradient: "from-indigo-400 to-violet-500",
                    icon: "📊",
                    badge: "New"
                  },
                  {
                    id: "TPL-03",
                    title: "E-Commerce Store",
                    desc: "Product grid, cart drawer, filter sidebar, and checkout flow with real-time price calculations.",
                    tag: "Commerce",
                    color: "rose",
                    gradient: "from-rose-400 to-pink-500",
                    icon: "🛍️",
                    badge: ""
                  },
                  {
                    id: "TPL-04",
                    title: "Auth Portal",
                    desc: "Login and signup screens, password recovery flow, and OAuth social buttons with smooth animations.",
                    tag: "Auth",
                    color: "cyan",
                    gradient: "from-cyan-400 to-blue-500",
                    icon: "🔐",
                    badge: ""
                  }
                ].map((tpl, i) => (
                  <div
                    key={i}
                    className="group relative bg-gradient-to-br from-[#0a0f1d] to-[#070c18] border border-slate-900 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                    onClick={() => handleStartBuild(`Create a ${tpl.title}: ${tpl.desc}`)}
                  >
                    {/* Card top gradient banner */}
                    <div className={`h-28 bg-gradient-to-br ${tpl.gradient} opacity-[0.12] group-hover:opacity-[0.18] transition-opacity relative`}>
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">{tpl.icon}</div>
                    </div>

                    {/* Badge */}
                    {tpl.badge && (
                      <div className="absolute top-3 right-3">
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${tpl.gradient} text-white shadow-sm`}>
                          {tpl.badge}
                        </span>
                      </div>
                    )}

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{tpl.id}</span>
                        <span className={`text-[8px] font-mono uppercase tracking-wide px-2 py-0.5 rounded bg-slate-800 text-slate-400`}>{tpl.tag}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-tight">{tpl.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{tpl.desc}</p>
                      <button className={`w-full mt-1 py-2 rounded-xl text-[10px] font-bold text-slate-950 bg-gradient-to-r ${tpl.gradient} opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5`}>
                        <Play className="w-3 h-3" /> Use This Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 2 - 4 More Templates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    id: "TPL-05",
                    title: "Portfolio Site",
                    desc: "Creative dev portfolio with animated hero, project showcase grid, skills section, and contact form.",
                    tag: "Portfolio",
                    color: "amber",
                    gradient: "from-amber-400 to-orange-500",
                    icon: "✨",
                    badge: ""
                  },
                  {
                    id: "TPL-06",
                    title: "Blog Platform",
                    desc: "Article listing, reading view, author profile, tag filter sidebar, and dark mode-ready typography.",
                    tag: "Content",
                    color: "emerald",
                    gradient: "from-emerald-400 to-teal-600",
                    icon: "📝",
                    badge: "Trending"
                  },
                  {
                    id: "TPL-07",
                    title: "API Docs Hub",
                    desc: "Developer documentation layout with sidebar navigation, code blocks, endpoint explorer, and search.",
                    tag: "Docs",
                    color: "violet",
                    gradient: "from-violet-400 to-purple-600",
                    icon: "📚",
                    badge: ""
                  },
                  {
                    id: "TPL-08",
                    title: "Kanban Board",
                    desc: "Drag-and-drop task management board with status columns, assignee chips, and priority tags.",
                    tag: "Productivity",
                    color: "pink",
                    gradient: "from-pink-400 to-rose-500",
                    icon: "🗂️",
                    badge: "Beta"
                  }
                ].map((tpl, i) => (
                  <div
                    key={i}
                    className="group relative bg-gradient-to-br from-[#0a0f1d] to-[#070c18] border border-slate-900 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                    onClick={() => handleStartBuild(`Create a ${tpl.title}: ${tpl.desc}`)}
                  >
                    {/* Card top gradient banner */}
                    <div className={`h-28 bg-gradient-to-br ${tpl.gradient} opacity-[0.12] group-hover:opacity-[0.18] transition-opacity relative`}>
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">{tpl.icon}</div>
                    </div>

                    {/* Badge */}
                    {tpl.badge && (
                      <div className="absolute top-3 right-3">
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${tpl.gradient} text-white shadow-sm`}>
                          {tpl.badge}
                        </span>
                      </div>
                    )}

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{tpl.id}</span>
                        <span className={`text-[8px] font-mono uppercase tracking-wide px-2 py-0.5 rounded bg-slate-800 text-slate-400`}>{tpl.tag}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-tight">{tpl.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{tpl.desc}</p>
                      <button className={`w-full mt-1 py-2 rounded-xl text-[10px] font-bold text-slate-950 bg-gradient-to-r ${tpl.gradient} opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5`}>
                        <Play className="w-3 h-3" /> Use This Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Browse All CTA */}
              <div className="text-center">
                <button className="inline-flex items-center gap-2 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-semibold px-6 py-3 rounded-xl transition-all hover:bg-indigo-500/5">
                  <Layers className="w-4 h-4" />
                  Browse All Templates
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>

            {/* 3) ABOUT US SECTION - PREMIUM REDESIGN */}
            <section id="about" className="w-full pt-20 text-left space-y-12">
              <div className="space-y-3 text-center">
                <span className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-mono uppercase tracking-widest px-4 py-1.5 rounded-full">
                  <Heart className="w-3 h-3" /> About Our Mission
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Built by Developers, For Developers</h3>
                <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  vCreative was born from frustration with overcomplicated dev tools. We believe building beautiful UIs should be fast, fun, and accessible to everyone.
                </p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { value: "10K+", label: "Active Developers", color: "text-teal-400", bg: "bg-teal-500/5 border-teal-500/10" },
                  { value: "50K+", label: "Components Built", color: "text-indigo-400", bg: "bg-indigo-500/5 border-indigo-500/10" },
                  { value: "99.9%", label: "Uptime SLA", color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/10" },
                  { value: "8+", label: "Template Presets", color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/10" },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} border rounded-2xl p-5 text-center space-y-1`}>
                    <p className={`text-2xl font-extrabold ${stat.color} font-mono`}>{stat.value}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Mission + Terminal side by side */}
              <div className="bg-gradient-to-br from-[#0a0f1d] to-[#070c18] border border-slate-900 rounded-3xl p-7 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white">Our Philosophy</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      At vCreative Workspace, we prioritize engineering craft over generic scaffolding. Every spacing system, border variable, and viewport constraint follows strict design principles to produce readable, maintainable components.
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      We eliminate bloated dependencies and focus purely on layout fidelity. Connect your MongoDB cluster or stay local — the experience stays seamless either way.
                    </p>
                  </div>

                  {/* Team tags */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Core Team</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: "Bilal A.", role: "Founder & Lead Dev", color: "from-teal-400 to-indigo-500" },
                        { name: "Design AI", role: "UI Systems", color: "from-violet-400 to-pink-500" },
                        { name: "Community", role: "Open Contributors", color: "from-amber-400 to-orange-500" },
                      ].map((member, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2">
                          <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${member.color} flex items-center justify-center text-[9px] font-bold text-slate-950`}>
                            {member.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-white">{member.name}</p>
                            <p className="text-[9px] text-slate-500">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="bg-teal-500/10 text-teal-400 text-[10px] px-3 py-1 rounded-full font-mono font-bold border border-teal-500/20">100% Client-Side Protected</div>
                    <div className="bg-indigo-500/10 text-indigo-400 text-[10px] px-3 py-1 rounded-full font-mono font-bold border border-indigo-500/20">Zero Vendor Lock-in</div>
                    <div className="bg-emerald-500/10 text-emerald-400 text-[10px] px-3 py-1 rounded-full font-mono font-bold border border-emerald-500/20">Open Architecture</div>
                  </div>
                </div>
                
                {/* Graphical terminal mockup */}
                <div className="bg-[#020408] p-5 rounded-2xl border border-slate-900 font-mono space-y-3 shadow-inner">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    </div>
                    <span className="text-[10px] text-slate-600 ml-2">vC_core_system.sh</span>
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-slate-600">$ npx vcreative init --workspace</p>
                  <p className="text-[11px] text-teal-400">✓ Initializing sandbox environment...</p>
                  <p className="text-[11px] text-indigo-400">✓ Loading template presets (8 found)</p>
                  <p className="text-[11px] text-emerald-400">✓ MongoDB cluster connected successfully</p>
                  <p className="text-[11px] text-violet-400">✓ Urdu i18n engine loaded</p>
                  <p className="text-[11px] text-amber-400">✓ Voice recognition module active</p>
                  <p className="text-[11px] text-slate-500">$ <span className="text-white animate-pulse">_</span></p>
                </div>
              </div>

              {/* Values cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <Shield className="w-4 h-4" />, title: "Privacy First", desc: "All sessions run locally. We never log your prompts or sell your data.", color: "text-teal-400", bg: "bg-teal-500/5 border-teal-500/10" },
                  { icon: <Sparkles className="w-4 h-4" />, title: "Craft Over Speed", desc: "We obsess over design quality, not just quick scaffolding outputs.", color: "text-violet-400", bg: "bg-violet-500/5 border-violet-500/10" },
                  { icon: <Globe className="w-4 h-4" />, title: "Built for All", desc: "Urdu-first interface design makes us accessible to a billion+ new developers.", color: "text-amber-400", bg: "bg-amber-500/5 border-amber-500/10" },
                ].map((val, i) => (
                  <div key={i} className={`${val.bg} border rounded-2xl p-5 space-y-3`}>
                    <div className={`${val.color}`}>{val.icon}</div>
                    <h5 className="text-sm font-bold text-white">{val.title}</h5>
                    <p className="text-xs text-slate-500 leading-relaxed">{val.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 4) PRICING SECTION - PREMIUM REDESIGN */}
            <section id="pricing" className="w-full pt-20 text-left space-y-10">
              <div className="space-y-3 text-center">
                <span className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono uppercase tracking-widest px-4 py-1.5 rounded-full">
                  <CreditCard className="w-3 h-3" /> Transparent Pricing
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Simple Plans, No Hidden Fees</h3>
                <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  Start for free and scale as your projects grow. Every plan includes core sandbox features with no vendor lock-in.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                
                {/* Tier 1: Free */}
                <div className="group bg-gradient-to-br from-[#0a0f1d] to-[#070c18] border border-slate-800 hover:border-slate-700 p-7 rounded-2xl flex flex-col justify-between space-y-7 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/50">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="inline-block text-[9px] bg-slate-800 text-slate-400 font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">Starter</span>
                      <h4 className="text-xl font-extrabold text-white">Free Sandbox</h4>
                      <p className="text-xs text-slate-500">Perfect for solo projects and exploration.</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-4xl font-black text-white font-mono">
                        $0
                      </p>
                      <p className="text-xs text-slate-500">Forever free — no credit card required</p>
                    </div>
                    
                    <div className="h-px bg-slate-800/60" />
                    
                    <ul className="space-y-3">
                      {[
                        { text: "Local browser storage", ok: true },
                        { text: "4 template presets", ok: true },
                        { text: "Urdu / English toggle", ok: true },
                        { text: "Voice input (5 uses/day)", ok: true },
                        { text: "MongoDB cloud sync", ok: false },
                        { text: "Priority compilation", ok: false },
                      ].map((item, i) => (
                        <li key={i} className={`flex items-center gap-2.5 text-xs ${item.ok ? "text-slate-300" : "text-slate-600"}`}>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                            item.ok ? "bg-teal-500/10 text-teal-400" : "bg-slate-800 text-slate-600"
                          }`}>
                            {item.ok ? "✓" : "✗"}
                          </span>
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => router.push("/signup")}
                    className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs py-3 rounded-xl cursor-pointer border border-slate-700 hover:border-slate-600 transition-all"
                  >
                    Start Building Free
                  </button>
                </div>

                {/* Tier 2: $10 Professional — FEATURED */}
                <div className="relative bg-gradient-to-br from-[#0c1528] to-[#080e1c] border border-teal-500/30 p-7 rounded-2xl flex flex-col justify-between space-y-7 shadow-2xl shadow-teal-500/5 scale-[1.02]">
                  {/* Popular badge */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-950 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-teal-500/20">
                      ⭐ Most Popular
                    </span>
                  </div>

                  {/* Glow orb */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="inline-block text-[9px] bg-teal-500/15 text-teal-400 font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-teal-500/20">Professional</span>
                      <h4 className="text-xl font-extrabold text-white">Pro Developer</h4>
                      <p className="text-xs text-slate-400">For serious builders shipping real products.</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-black text-white font-mono">$10</p>
                        <p className="text-xs text-slate-400 mb-1.5">/ month</p>
                      </div>
                      <p className="text-xs text-teal-400/70">Save 20% with annual billing</p>
                    </div>
                    
                    <div className="h-px bg-teal-500/10" />
                    
                    <ul className="space-y-3">
                      {[
                        { text: "Everything in Free", ok: true },
                        { text: "All 8 template presets", ok: true },
                        { text: "MongoDB cloud sync", ok: true },
                        { text: "Unlimited voice input", ok: true },
                        { text: "Priority webpack compilation", ok: true },
                        { text: "Dedicated support channel", ok: true },
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                          <span className="w-4 h-4 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center text-[10px] shrink-0 border border-teal-500/10">
                            ✓
                          </span>
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => router.push("/signup")}
                    className="w-full bg-gradient-to-r from-teal-400 to-indigo-500 hover:opacity-95 text-slate-950 font-extrabold text-xs py-3 rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-lg shadow-teal-500/20"
                  >
                    Start Pro Plan →
                  </button>
                </div>

                {/* Tier 3: $30 Enterprise */}
                <div className="group bg-gradient-to-br from-[#0a0f1d] to-[#070c18] border border-slate-800 hover:border-violet-500/20 p-7 rounded-2xl flex flex-col justify-between space-y-7 transition-all duration-300 hover:shadow-xl hover:shadow-violet-900/20">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="inline-block text-[9px] bg-violet-500/10 text-violet-400 font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border border-violet-500/20">Enterprise</span>
                      <h4 className="text-xl font-extrabold text-white">Team Edition</h4>
                      <p className="text-xs text-slate-500">Full power for agencies and enterprise teams.</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-black text-white font-mono">$30</p>
                        <p className="text-xs text-slate-400 mb-1.5">/ month</p>
                      </div>
                      <p className="text-xs text-slate-500">Per workspace — unlimited team seats</p>
                    </div>
                    
                    <div className="h-px bg-slate-800/60" />
                    
                    <ul className="space-y-3">
                      {[
                        { text: "Everything in Pro", ok: true },
                        { text: "Unlimited MongoDB storage", ok: true },
                        { text: "Screenshot-to-UI analyzer", ok: true },
                        { text: "Dedicated 24/7 container", ok: true },
                        { text: "Custom auth API integration", ok: true },
                        { text: "White-label branding options", ok: true },
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                          <span className="w-4 h-4 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center text-[10px] shrink-0 border border-violet-500/10">
                            ✓
                          </span>
                          {item.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    onClick={() => router.push("/signup")}
                    className="w-full bg-slate-800 hover:bg-violet-500/10 text-slate-200 hover:text-violet-300 font-bold text-xs py-3 rounded-xl cursor-pointer border border-slate-700 hover:border-violet-500/30 transition-all"
                  >
                    Contact for Enterprise
                  </button>
                </div>

              </div>

              {/* FAQ / Guarantee strip */}
              <div className="bg-gradient-to-r from-teal-500/5 via-indigo-500/5 to-violet-500/5 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">30-Day Money-Back Guarantee</p>
                    <p className="text-[10px] text-slate-500">Not satisfied? We refund every penny — no questions asked.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Cancel Anytime</p>
                    <p className="text-[10px] text-slate-500">No contracts, no lock-in periods.</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/signup")}
                  className="shrink-0 bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-950 font-extrabold text-xs px-6 py-2.5 rounded-xl cursor-pointer hover:opacity-90 transition-all"
                >
                  Get Started Free
                </button>
              </div>
            </section>

          </section>

          {/* ========================================================
             LARGE GUEST FOOTER WITH LINKS & GIFT FORM
             ======================================================== */}
          <footer className="mt-12 bg-[#02050b] border-t border-slate-900/60 transition-colors" id="main-root-footer">
            
            <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-5 gap-8 text-left">
              
              {/* Branding column */}
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded bg-teal-400 flex items-center justify-center text-slate-950 font-black text-sm">
                    vC
                  </div>
                  <span className="font-bold text-white text-md">vCreative Workspace</span>
                </div>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed leading-medium">
                  The clean sandbox terminal optimized for isolated prompt compilation, framing real components sans bloat parameters and telemetry noise.
                </p>
                <div className="text-[10px] text-teal-400/80 font-mono bg-teal-500/5 border border-teal-500/10 px-3 py-1.5 rounded-lg inline-block">
                  Secure Port Host: Container 3000
                </div>
              </div>

              {/* Links Column 1 */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">Product Stack</h4>
                <ul className="space-y-2 text-[11px] text-slate-550">
                  <li className="hover:text-teal-400 cursor-pointer">Workspace Engine</li>
                  <li className="hover:text-teal-400 cursor-pointer">Terminal Host</li>
                  <li className="hover:text-teal-400 cursor-pointer">Presets catalogs</li>
                  <li className="hover:text-teal-400 cursor-pointer">Security schemas</li>
                </ul>
              </div>

              {/* Links Column 2 */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">Resources</h4>
                <ul className="space-y-2 text-[11px] text-slate-550">
                  <li className="hover:text-teal-400 cursor-pointer">Urdu translation API</li>
                  <li className="hover:text-teal-400 cursor-pointer">Operational manual</li>
                  <li className="hover:text-teal-400 cursor-pointer">MongoDB setups</li>
                  <li className="hover:text-teal-400 cursor-pointer">Local caches</li>
                </ul>
              </div>

              {/* Special Gift Section Form (Email and Message input) as requested */}
              <div className="space-y-4 md:col-span-1">
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-teal-450 text-teal-400" />
                    Transmit a gift
                  </h4>
                  <p className="text-[10px] text-slate-500">Deploy premium Sandbox voucher to a colleague.</p>
                </div>

                <form onSubmit={handleSendGift} className="space-y-2 text-[11px]">
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Colleague's email..."
                      value={giftEmail}
                      onChange={(e) => setGiftEmail(e.target.value)}
                      className="w-full bg-[#050811] text-[10px] text-white placeholder-slate-705 border border-slate-900 rounded-lg p-2 focus:border-teal-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="Add personal message..."
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      className="w-full bg-[#050811] text-[10px] text-white placeholder-slate-705 border border-slate-900 rounded-lg p-2 focus:border-teal-400 focus:outline-none h-12 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-950 font-bold py-1.5 rounded-lg text-[10px] cursor-pointer hover:opacity-90 active:scale-95 transition-all text-center"
                  >
                    Send Gift Code
                  </button>
                </form>
              </div>

            </div>

            {/* Sub-footer */}
            <div className="py-6 border-t border-white/[0.02] text-center text-[10px] text-slate-600 font-mono">
              <p>© 2026 vCreative Workspace. All container allocations fully secured. Isolated Sandbox v2.</p>
            </div>

          </footer>

        </main>

      </div>

    </div>
  );
}
