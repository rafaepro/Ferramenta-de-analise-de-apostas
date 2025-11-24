
import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart2, Target, Search, TrendingUp, BrainCircuit, ShieldCheck, 
  AlertTriangle, BookOpen, FileText, Activity, Play, RefreshCw, Zap, 
  CheckCircle2, ThermometerSun, Waves, Siren, Ban, AlertOctagon, Split, 
  X, Volume2, VolumeX, Link as LinkIcon, Ticket, Coins, ArrowRight,
  Menu, ChevronLeft, ChevronRight, Settings, LogOut, User, Eye, EyeOff,
  LayoutDashboard, Image as ImageIcon, Lock, UserPlus, LogIn
} from 'lucide-react';
import { analyzeMatch } from './services/geminiService';
import { AnalysisResult, ViewMode } from './types';
import { SectionCard, DataRow } from './components/SectionCard';
import { ProbabilityChart } from './components/ProbabilityChart';

// --- CONSTANTS ---

const ALERT_SOUND = "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7c97Qd5bd8MDbRgdE+twwAu2f/7ced+b/1kL/7c97Qd5bd8MDbRgdE+twwAu2f/7ced+b/1kFL//uQZAAABlkGWOAAIAAAAZY4AAgAAjVhWcwIAAACNWFZzAgACMCizLQABDsJ1XcwEAAiDOT523//+5BkAAAGWQZY4AAgAAABljgACAACNWFZzAgAAAIsIM5Pnbf//7kGQAAA0OBF7AAAAAANAQXsAAAAAM1YVnMAAAADNWFZzAAAAA==";
const STORAGE_KEYS = {
  USERS: 'betmind_users_v1',
  CONFIG: 'betmind_config_v1',
  CURRENT_USER: 'betmind_session_v1'
};

const DEFAULT_CONFIG = {
  logoUrl: '',
  loginBgUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2505&auto=format&fit=crop',
  appBgUrl: ''
};

// --- TYPES ---

interface AppConfig {
  logoUrl: string;
  loginBgUrl: string;
  appBgUrl: string;
}

interface UserProfile {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'USER';
}

// --- HELPER COMPONENTS ---

const PasswordInput = ({ value, onChange, placeholder, name }: any) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        required
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

// --- MAIN COMPONENT ---

function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState<string | null>(null);

  // App Logic State
  const [query, setQuery] = useState('');
  const [query2, setQuery2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [data2, setData2] = useState<AnalysisResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeScreen, setActiveScreen] = useState<'APP' | 'ADMIN'>('APP');

  // Initialization
  useEffect(() => {
    // Load Config
    const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (savedConfig) setConfig(JSON.parse(savedConfig));

    // Restore Session
    const savedSession = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedSession) setCurrentUser(JSON.parse(savedSession));
  }, []);

  // --- AUTH HANDLERS ---

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Admin Check
    if (authForm.email === 'adminn' && authForm.password === 'admintrihard') {
      const adminUser: UserProfile = { name: 'Administrador', email: 'adminn', role: 'ADMIN' };
      loginUser(adminUser);
      return;
    }

    // Regular User Check
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find((u: UserProfile) => u.email === authForm.email && u.password === authForm.password);

    if (user) {
      const { password, ...safeUser } = user;
      loginUser(safeUser as UserProfile);
    } else {
      setAuthError('Credenciais inválidas.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authForm.password !== authForm.confirmPassword) {
      setAuthError('As senhas não conferem.');
      return;
    }

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (users.find((u: UserProfile) => u.email === authForm.email)) {
      setAuthError('Email já cadastrado.');
      return;
    }

    const newUser = { name: authForm.name, email: authForm.email, password: authForm.password, role: 'USER' };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Auto login
    const { password, ...safeUser } = newUser;
    loginUser(safeUser as UserProfile);
  };

  const loginUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setData(null);
    setData2(null);
    setActiveScreen('APP');
  };

  // --- ADMIN HANDLERS ---

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    alert('Configurações salvas com sucesso!');
  };

  // --- APP LOGIC (Previously in App component) ---

  const getRiskLevel = (volatilityText: string) => {
    const text = volatilityText.toLowerCase();
    if (text.includes('alta') || text.includes('high') || text.includes('extrema')) return 3;
    if (text.includes('média') || text.includes('media') || text.includes('moderada')) return 2;
    return 1;
  };

  useEffect(() => {
    if (!soundEnabled) return;
    const checkAndPlaySound = (result: AnalysisResult) => {
      if (!result || !result.risks) return false;
      const riskLevel = getRiskLevel(result.risks.volatility);
      const zebraText = result.risks.underdogSignals ? result.risks.underdogSignals.toLowerCase() : '';
      const isZebraRisk = zebraText.includes('alta') || zebraText.includes('grande') || zebraText.includes('chance real');
      return riskLevel === 3 || isZebraRisk;
    };

    let shouldPlay = false;
    if (data && checkAndPlaySound(data)) shouldPlay = true;
    if (isCompareMode && data2 && checkAndPlaySound(data2)) shouldPlay = true;

    if (shouldPlay) {
      try {
        const audio = new Audio(ALERT_SOUND);
        audio.volume = 0.3;
        audio.play().catch(e => console.warn(e));
      } catch (e) { console.error(e); }
    }
  }, [data, data2, isCompareMode, soundEnabled]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);
    setData2(null);
    setViewMode(ViewMode.DASHBOARD);

    try {
      if (isCompareMode && query2.trim()) {
        const [result1, result2] = await Promise.all([analyzeMatch(query), analyzeMatch(query2)]);
        setData(result1);
        setData2(result2);
      } else {
        const result = await analyzeMatch(query);
        setData(result);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Falha ao analisar a partida.");
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysisContent = (currentData: AnalysisResult, isCompact: boolean = false) => {
    if (!currentData) return null;
    const showAll = viewMode === ViewMode.DASHBOARD;
    const cardFullWidth = isCompact ? 'col-span-1' : 'col-span-1 md:col-span-2 lg:col-span-3';

    return (
      <div className={`grid ${isCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6 animate-fade-in`}>
        {showAll && (
           <div className={`${cardFullWidth} bg-emerald-950/40 border-2 border-dashed border-emerald-500/30 rounded-xl p-0 shadow-2xl relative overflow-hidden group`}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <div className="bg-emerald-600/20 border-b border-emerald-500/30 p-3 flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-emerald-100 tracking-wider uppercase text-sm">Bilhete de Alta Confiança</span>
                 </div>
                 <div className="text-xs font-mono text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded">AI CONFIRMED</div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                 <div className="flex flex-col gap-2">
                    <span className="text-xs text-emerald-500 uppercase font-bold tracking-wide">Melhor Oportunidade</span>
                    <div className="flex items-start gap-3">
                       <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-1" />
                       <div>
                          <h2 className="text-2xl font-bold text-white leading-tight">{currentData.safeEntries.bestPreLive}</h2>
                          <p className="text-sm text-slate-400 mt-1">{currentData.safeEntries.mostReliableType}</p>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center md:justify-end gap-4 md:border-l border-slate-700 md:pl-6">
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-emerald-500/20 min-w-[140px]">
                        <div className="flex items-center gap-2 mb-1">
                           <Coins className="w-4 h-4 text-yellow-400" />
                           <span className="text-xs text-slate-400 uppercase font-bold">Stake</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-300">{currentData.strategy.suggestedStake}</p>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {showAll && currentData.highValueTips?.length > 0 && (
          <div className={`${cardFullWidth} bg-gradient-to-r from-amber-900/40 to-yellow-900/20 border border-amber-600/30 rounded-xl p-6 shadow-xl relative overflow-hidden`}>
             <div className="flex items-center gap-3 mb-4 border-b border-amber-600/30 pb-3 relative z-10">
                <div className="p-2 rounded-lg bg-amber-500/20"><Zap className="w-6 h-6 text-amber-400" /></div>
                <h3 className="text-xl font-bold text-amber-100">Destaques Matemáticos</h3>
             </div>
             <div className={`grid ${isCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-4 relative z-10`}>
                {currentData.highValueTips.map((tip, idx) => (
                   <div key={idx} className="bg-slate-900/60 border border-amber-500/20 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-xs font-bold text-amber-500 uppercase">{tip.market}</span>
                         <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">{tip.probability}</span>
                      </div>
                      <p className="text-lg font-bold text-white mb-2">{tip.selection}</p>
                      <p className="text-xs text-slate-400">{tip.reason}</p>
                   </div>
                ))}
             </div>
          </div>
        )}

        {(showAll || viewMode === ViewMode.STATS) && (
          <SectionCard title="Estatísticas" icon={BarChart2} colorClass="text-blue-400" fullWidth={isCompact}>
            <DataRow label="Forma" value={currentData.statistics.last5GamesForm} />
            <DataRow label="Médias" value={currentData.statistics.avgGoalsScoredConceded} />
            <DataRow label="Casa/Fora" value={currentData.statistics.homeAwayStrength} />
            <DataRow label="Consistência" value={currentData.statistics.defensiveConsistency} />
            <DataRow label="Padrão" value={currentData.statistics.goalPatterns} />
          </SectionCard>
        )}

        {(showAll || viewMode === ViewMode.PROBS) && (
          <SectionCard title="Probabilidades" icon={Target} colorClass="text-emerald-400" fullWidth={isCompact}>
             <ProbabilityChart data={currentData.probabilities} />
          </SectionCard>
        )}

        {(showAll || viewMode === ViewMode.PATTERNS) && (
          <SectionCard title="Padrões" icon={Search} colorClass="text-purple-400" fullWidth={isCompact}>
            <DataRow label="Marca Cedo" value={currentData.hiddenPatterns.earlyGoalTeam} />
            <DataRow label="Marca Tarde" value={currentData.hiddenPatterns.lateGoalTeam} />
            <DataRow label="Sofre Final" value={currentData.hiddenPatterns.concedeLateTeam} />
            <DataRow label="Pressão" value={currentData.hiddenPatterns.pressurePeaks} />
          </SectionCard>
        )}

        {(showAll || viewMode === ViewMode.RISKS) && (
          <SectionCard title="Riscos" icon={AlertTriangle} colorClass="text-red-500" fullWidth={isCompact}>
             <div className="bg-slate-900/50 p-4 rounded-xl border border-red-500/20 mb-4">
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                      <ThermometerSun className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold text-slate-400 uppercase">Volatilidade</span>
                   </div>
                   {soundEnabled && (getRiskLevel(currentData.risks.volatility) === 3) && <Volume2 className="w-4 h-4 text-red-500 animate-pulse" />}
                </div>
                {(() => {
                   const level = getRiskLevel(currentData.risks.volatility);
                   return (
                     <>
                        <div className="flex gap-1 h-3 mb-2">
                           <div className={`flex-1 rounded-l-md ${level >= 1 ? 'bg-emerald-500' : 'bg-slate-700 opacity-20'}`}></div>
                           <div className={`flex-1 ${level >= 2 ? 'bg-yellow-500' : 'bg-slate-700 opacity-20'}`}></div>
                           <div className={`flex-1 rounded-r-md ${level >= 3 ? 'bg-red-600 animate-pulse' : 'bg-slate-700 opacity-20'}`}></div>
                        </div>
                        <span className={`text-lg font-bold ${level === 3 ? 'text-red-500' : level === 2 ? 'text-yellow-500' : 'text-emerald-500'}`}>{currentData.risks.volatility}</span>
                     </>
                   );
                })()}
             </div>
             <div className="bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                <div className="flex items-center gap-2 mb-1">
                   <Siren className="w-4 h-4 text-red-400" />
                   <span className="text-xs font-bold text-red-400 uppercase">Zebra</span>
                </div>
                <p className="text-sm text-slate-300">{currentData.risks.underdogSignals}</p>
             </div>
          </SectionCard>
        )}

        {(showAll || viewMode === ViewMode.STRATEGY) && (
          <SectionCard title="Estratégia" icon={BookOpen} colorClass="text-indigo-400" fullWidth={isCompact}>
             <div className="bg-indigo-500/10 p-3 rounded border border-indigo-500/20 mb-3">
               <p className="text-xs text-indigo-300 uppercase font-bold">Plano de Entrada</p>
               <p className="text-sm text-white">{currentData.strategy.entryPlan}</p>
             </div>
             <p className="text-slate-300 italic text-sm">"{currentData.strategy.finalRead}"</p>
          </SectionCard>
        )}
      </div>
    );
  };

  // --- RENDER VIEWS ---

  // 1. Auth View
  if (!currentUser) {
    const bgStyle = config.loginBgUrl ? { backgroundImage: `url(${config.loginBgUrl})` } : {};
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-cover bg-center relative" style={bgStyle}>
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
        
        <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/90 border border-slate-700 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" className="h-16 mx-auto mb-4 object-contain" />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
            )}
            <h1 className="text-3xl font-bold text-white mb-2">BetMind Pro</h1>
            <p className="text-slate-400">Entre para acessar análises de elite.</p>
          </div>

          <form onSubmit={authMode === 'LOGIN' ? handleLogin : handleRegister} className="space-y-4">
            {authMode === 'REGISTER' && (
               <input
                 type="text"
                 placeholder="Nome Completo"
                 value={authForm.name}
                 onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                 className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                 required
               />
            )}
            
            <input
              type={authMode === 'LOGIN' ? "text" : "email"}
              placeholder={authMode === 'LOGIN' ? "Email ou Usuário" : "Email"}
              value={authForm.email}
              onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              required
            />

            <PasswordInput 
              name="password"
              placeholder="Senha"
              value={authForm.password}
              onChange={(e: any) => setAuthForm({...authForm, password: e.target.value})}
            />

            {authMode === 'REGISTER' && (
              <PasswordInput 
                name="confirmPassword"
                placeholder="Confirme a Senha"
                value={authForm.confirmPassword}
                onChange={(e: any) => setAuthForm({...authForm, confirmPassword: e.target.value})}
              />
            )}

            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-2 rounded text-sm flex items-center gap-2">
                 <AlertTriangle size={14} /> {authError}
              </div>
            )}

            <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg">
              {authMode === 'LOGIN' ? 'Entrar na Plataforma' : 'Criar Conta Gratuita'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setAuthError(null); }}
              className="text-slate-400 hover:text-emerald-400 text-sm transition-colors"
            >
              {authMode === 'LOGIN' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main App Layout
  const mainBgStyle = config.appBgUrl ? { backgroundImage: `url(${config.appBgUrl})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' } : {};
  
  const navItems = [
    { mode: ViewMode.DASHBOARD, label: 'Visão Geral', icon: Activity },
    { mode: ViewMode.STATS, label: 'Estatísticas', icon: BarChart2 },
    { mode: ViewMode.PROBS, label: 'Probabilidades', icon: Target },
    { mode: ViewMode.PATTERNS, label: 'Padrões', icon: Search },
    { mode: ViewMode.RISKS, label: 'Riscos', icon: AlertTriangle },
    { mode: ViewMode.STRATEGY, label: 'Estratégia', icon: BookOpen },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-white" style={mainBgStyle}>
      {/* Overlay for Sidebar on Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside 
        className={`fixed lg:static top-0 left-0 z-30 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-center border-b border-slate-800 relative">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" className="h-8 object-contain" />
              ) : (
                <div className="bg-gradient-to-tr from-emerald-600 to-blue-600 p-1.5 rounded-lg">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="font-bold text-lg tracking-tight">BetMind Pro</span>
            </div>
          ) : (
            <div className="bg-gradient-to-tr from-emerald-600 to-blue-600 p-2 rounded-lg">
               <BrainCircuit className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2 px-3">
           
           {/* Primary Actions */}
           <button
             onClick={() => { setActiveScreen('APP'); if(window.innerWidth < 1024) setSidebarOpen(false); }}
             className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeScreen === 'APP' && !data ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
           >
              <LayoutDashboard size={20} />
              {sidebarOpen && <span className="font-medium">Dashboard</span>}
           </button>
           
           {/* Dynamic Tabs (Only if data exists and on APP screen) */}
           {activeScreen === 'APP' && data && (
             <div className="mt-4 pt-4 border-t border-slate-800">
               {sidebarOpen && <p className="px-3 text-xs font-bold text-slate-500 uppercase mb-2">Análise</p>}
               {navItems.map(item => (
                 <button
                   key={item.mode}
                   onClick={() => setViewMode(item.mode)}
                   className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                     viewMode === item.mode 
                       ? 'bg-gradient-to-r from-emerald-600/90 to-emerald-800/90 text-white shadow-lg shadow-emerald-900/20' 
                       : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                   }`}
                   title={!sidebarOpen ? item.label : ''}
                 >
                   <item.icon size={18} />
                   {sidebarOpen && <span>{item.label}</span>}
                 </button>
               ))}
             </div>
           )}

           {/* Admin Link */}
           {currentUser.role === 'ADMIN' && (
             <div className="mt-4 pt-4 border-t border-slate-800">
               {sidebarOpen && <p className="px-3 text-xs font-bold text-slate-500 uppercase mb-2">Administração</p>}
               <button
                 onClick={() => { setActiveScreen('ADMIN'); if(window.innerWidth < 1024) setSidebarOpen(false); }}
                 className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${activeScreen === 'ADMIN' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
               >
                  <Settings size={20} />
                  {sidebarOpen && <span className="font-medium">Configurações</span>}
               </button>
             </div>
           )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
           <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                 <User size={20} className="text-slate-400" />
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                   <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                   <p className="text-xs text-slate-500 truncate">{currentUser.role === 'ADMIN' ? 'Administrador' : 'Membro Pro'}</p>
                </div>
              )}
           </div>
           {sidebarOpen && (
             <button 
               onClick={logout}
               className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors py-2 rounded hover:bg-slate-800"
             >
               <LogOut size={14} /> Sair da Conta
             </button>
           )}
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
              {activeScreen === 'APP' && (
                <div className="flex items-center gap-2">
                   <button
                     onClick={() => setSoundEnabled(!soundEnabled)}
                     className={`p-2 rounded-lg text-xs font-medium transition-colors border flex items-center gap-2 ${soundEnabled ? 'bg-slate-800/50 border-emerald-500/30 text-emerald-400' : 'bg-transparent border-slate-700 text-slate-500'}`}
                   >
                      {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      <span className="hidden sm:inline">{soundEnabled ? 'Som Ativo' : 'Mudo'}</span>
                   </button>
                   <button
                     onClick={() => { setIsCompareMode(!isCompareMode); if(!isCompareMode) { setData2(null); setQuery2(''); } }}
                     className={`p-2 rounded-lg text-xs font-medium transition-colors border flex items-center gap-2 ${isCompareMode ? 'bg-blue-600/20 border-blue-500/50 text-blue-300' : 'bg-transparent border-slate-700 text-slate-400 hover:text-white'}`}
                   >
                      <Split size={16} />
                      <span className="hidden sm:inline">Comparar</span>
                   </button>
                </div>
              )}
           </div>
           
           <div className="text-xs font-mono text-slate-500">v3.0.1</div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           {activeScreen === 'ADMIN' ? (
             // --- ADMIN PANEL ---
             <div className="max-w-2xl mx-auto animate-fade-in">
               <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                 <Settings className="text-indigo-500" /> Painel Administrativo
               </h2>
               
               <form onSubmit={handleConfigSave} className="space-y-6">
                 <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700 shadow-xl">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4 border-b border-slate-700 pb-2">Identidade Visual</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">URL do Logotipo</label>
                        <div className="flex gap-2">
                           <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 text-slate-500"><ImageIcon size={20} /></div>
                           <input 
                             type="text" 
                             value={config.logoUrl}
                             onChange={e => setConfig({...config, logoUrl: e.target.value})}
                             placeholder="https://exemplo.com/logo.png"
                             className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 text-white focus:border-indigo-500 focus:outline-none"
                           />
                        </div>
                      </div>
                    </div>
                 </div>

                 <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700 shadow-xl">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4 border-b border-slate-700 pb-2">Planos de Fundo</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Imagem Tela de Login</label>
                        <input 
                             type="text" 
                             value={config.loginBgUrl}
                             onChange={e => setConfig({...config, loginBgUrl: e.target.value})}
                             className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                        />
                        {config.loginBgUrl && <div className="mt-2 h-20 rounded bg-cover bg-center opacity-50 border border-slate-600" style={{backgroundImage: `url(${config.loginBgUrl})`}}></div>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Imagem Tela Principal</label>
                        <input 
                             type="text" 
                             value={config.appBgUrl}
                             onChange={e => setConfig({...config, appBgUrl: e.target.value})}
                             className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                        />
                        {config.appBgUrl && <div className="mt-2 h-20 rounded bg-cover bg-center opacity-50 border border-slate-600" style={{backgroundImage: `url(${config.appBgUrl})`}}></div>}
                      </div>
                    </div>
                 </div>

                 <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => setActiveScreen('APP')} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                    <button type="submit" className="px-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg transition-all">Salvar Alterações</button>
                 </div>
               </form>
             </div>
           ) : (
             // --- APP DASHBOARD ---
             <div className="max-w-7xl mx-auto">
               
               {/* Search Hero */}
               <div className={`transition-all duration-500 ${data ? 'mb-8' : 'min-h-[60vh] flex flex-col justify-center items-center'}`}>
                  {!data && (
                    <div className="text-center mb-8 animate-fade-in-up">
                      <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Análise Esportiva <span className="text-emerald-500">Inteligente</span></h2>
                      <p className="text-slate-400 text-lg max-w-xl mx-auto">Cole o link da partida ou digite o nome do jogo. Nossa IA processará estatísticas, odds e notícias em segundos.</p>
                    </div>
                  )}

                  <form onSubmit={handleSearch} className={`w-full ${data ? 'max-w-4xl' : 'max-w-2xl'} mx-auto relative group z-10`}>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
                      <div className="flex-1 flex items-center border-b md:border-b-0 md:border-r border-slate-800 p-2">
                         <LinkIcon className="text-slate-500 ml-3" size={20} />
                         <input
                           type="text"
                           value={query}
                           onChange={(e) => setQuery(e.target.value)}
                           placeholder="Ex: Real Madrid vs Barcelona ou Link"
                           className="w-full bg-transparent px-4 py-3 text-white placeholder-slate-500 focus:outline-none"
                         />
                      </div>
                      {isCompareMode && (
                        <div className="flex-1 flex items-center border-b md:border-b-0 md:border-r border-slate-800 p-2 bg-slate-800/30 animate-in slide-in-from-right">
                           <LinkIcon className="text-slate-500 ml-3" size={20} />
                           <input
                             type="text"
                             value={query2}
                             onChange={(e) => setQuery2(e.target.value)}
                             placeholder="2º Jogo para Comparar"
                             className="w-full bg-transparent px-4 py-3 text-white placeholder-slate-500 focus:outline-none"
                           />
                        </div>
                      )}
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 font-bold transition-all md:w-auto w-full flex justify-center items-center gap-2"
                      >
                        {loading ? <RefreshCw className="animate-spin" /> : <ArrowRight />}
                      </button>
                    </div>
                  </form>
               </div>

               {/* Error */}
               {error && (
                  <div className="max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center gap-3">
                    <AlertTriangle /> {error}
                  </div>
               )}

               {/* Results Area */}
               {loading && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {[1, (isCompareMode ? 2 : 1)].slice(0, isCompareMode ? 2 : 1).map(i => (
                       <div key={i} className="space-y-4 animate-pulse">
                          <div className="h-12 bg-slate-800 rounded w-2/3 mx-auto"></div>
                          <div className="h-64 bg-slate-800 rounded"></div>
                          <div className="h-40 bg-slate-800 rounded"></div>
                       </div>
                    ))}
                 </div>
               )}

               {!loading && (
                 <div className="pb-10">
                   {isCompareMode && data && data2 ? (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                       <div className="hidden lg:flex absolute left-1/2 top-0 bottom-0 w-px bg-slate-800 items-center justify-center z-10"><div className="bg-slate-900 border border-slate-700 px-2 py-1 text-xs font-bold text-slate-500 rounded">VS</div></div>
                       <div className="space-y-6">
                          <div className="bg-slate-900/80 p-3 rounded-lg border border-blue-500/30 text-center sticky top-0 z-20 backdrop-blur"><h3 className="font-bold text-blue-200">{data.matchTitle}</h3></div>
                          {renderAnalysisContent(data, true)}
                       </div>
                       <div className="space-y-6">
                          <div className="bg-slate-900/80 p-3 rounded-lg border border-purple-500/30 text-center sticky top-0 z-20 backdrop-blur"><h3 className="font-bold text-purple-200">{data2.matchTitle}</h3></div>
                          {renderAnalysisContent(data2, true)}
                       </div>
                     </div>
                   ) : (
                     data && (
                       <>
                         {viewMode === ViewMode.DASHBOARD && (
                           <div className="text-center mb-8">
                             <h3 className="text-3xl font-bold text-white mb-2">{data.matchTitle}</h3>
                             <div className="h-1 w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto"></div>
                           </div>
                         )}
                         {renderAnalysisContent(data)}
                       </>
                     )
                   )}
                 </div>
               )}
             </div>
           )}
        </div>
      </main>
    </div>
  );
}

export default App;
