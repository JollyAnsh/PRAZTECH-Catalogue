import React, { useState, useEffect } from 'react';
import { Gamepad2, Maximize2, Minimize2, ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GamesPage: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'all' | 'contra' | 'mario'>('all');
  const [fullscreenId, setFullscreenId] = useState<string | null>(null);

  // Game start states (games only start when clicked)
  const [contraStarted, setContraStarted] = useState(false);
  const [marioStarted, setMarioStarted] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const activeElement = document.fullscreenElement || (document as any).webkitFullscreenElement;
      if (activeElement) {
        setFullscreenId(activeElement.id);
      } else {
        setFullscreenId(null);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = (containerId: string) => {
    const element = document.getElementById(containerId);
    if (!element) return;

    const isCurrentFullscreen = document.fullscreenElement?.id === containerId || (document as any).webkitFullscreenElement?.id === containerId;

    if (isCurrentFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    } else {
      if (element.requestFullscreen) {
        element.requestFullscreen().catch(() => {});
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#dfd5e8]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5e3e8b] font-semibold mb-1">
            <Gamepad2 className="w-4 h-4 text-[#5e3e8b]" />
            <span>WORKSHOP BREAK ROOM · RETRO ARCADE</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#2e075d]">
            Retro Games
          </h1>
          <p className="text-xs sm:text-sm text-[#665f6e] mt-1">
            Take a quick break between precision engine rebuilds and tool quotations.
          </p>
        </div>

        {/* Game Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-[#ede5f7]/60 p-1 rounded-xl border border-[#dfd5e8] text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveGame('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeGame === 'all'
                ? 'bg-[#381c59] text-white shadow-xs font-semibold'
                : 'text-[#2e075d] hover:bg-[#ede5f7]'
            }`}
          >
            All Games
          </button>
          <button
            type="button"
            onClick={() => setActiveGame('contra')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeGame === 'contra'
                ? 'bg-[#381c59] text-white shadow-xs font-semibold'
                : 'text-[#2e075d] hover:bg-[#ede5f7]'
            }`}
          >
            Contra 4
          </button>
          <button
            type="button"
            onClick={() => setActiveGame('mario')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeGame === 'mario'
                ? 'bg-[#381c59] text-white shadow-xs font-semibold'
                : 'text-[#2e075d] hover:bg-[#ede5f7]'
            }`}
          >
            Super Mario
          </button>
        </div>
      </div>

      {/* Games Display */}
      <div className="space-y-10">

        {/* Game 1: Contra 4 */}
        {(activeGame === 'all' || activeGame === 'contra') && (
          <section className="bg-white rounded-2xl border border-[#dfd5e8] p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#dfd5e8]">
              <div className="flex items-center space-x-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${contraStarted ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></span>
                <h2 className="font-heading font-bold text-lg sm:text-xl text-[#2e075d]">
                  Contra 4
                </h2>
                <span className="text-[10px] font-mono bg-[#ede5f7] text-[#2e075d] px-2 py-0.5 rounded font-semibold border border-[#dfd5e8]">
                  Action / Arcade
                </span>
                {contraStarted && (
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                    Running
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 self-start sm:self-auto">
                {contraStarted && (
                  <button
                    type="button"
                    onClick={() => setContraStarted(false)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#665f6e] hover:text-[#2e075d] bg-white hover:bg-[#ede5f7] border border-[#dfd5e8] transition-colors cursor-pointer"
                    title="Stop emulator"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggleFullscreen('contra-container')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2e075d] bg-[#ede5f7] hover:bg-[#dfd5e8] border border-[#dfd5e8] transition-colors cursor-pointer shadow-xs"
                >
                  {fullscreenId === 'contra-container' ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-[#5e3e8b]" />
                      <span>Exit Fullscreen</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-[#5e3e8b]" />
                      <span>Fullscreen</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Responsive Container */}
            <div
              id="contra-container"
              className="w-full max-w-[800px] aspect-[4/3] sm:aspect-[4/3] mx-auto rounded-xl overflow-hidden border border-[#dfd5e8] shadow-md bg-black relative group [&:fullscreen]:w-screen [&:fullscreen]:h-screen [&:fullscreen]:max-w-none [&:fullscreen]:rounded-none [&:fullscreen]:border-none [&:-webkit-full-screen]:w-screen [&:-webkit-full-screen]:h-screen [&:-webkit-full-screen]:max-w-none [&:-webkit-full-screen]:rounded-none"
            >
              {contraStarted ? (
                <>
                  {/* Floating Fullscreen Overlay Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleFullscreen('contra-container')}
                    className="absolute top-3 right-3 z-30 inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-black/75 hover:bg-black backdrop-blur-xs border border-white/20 transition-all opacity-85 hover:opacity-100 cursor-pointer shadow-md"
                    title={fullscreenId === 'contra-container' ? 'Exit Fullscreen (Esc)' : 'Expand Fullscreen'}
                  >
                    {fullscreenId === 'contra-container' ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span>Exit</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Fullscreen</span>
                      </>
                    )}
                  </button>

                  <iframe
                    src="https://retrogamesnexus.com/embed/games/contra-4"
                    className="w-full h-full border-0 absolute inset-0"
                    allowFullScreen
                    allow="fullscreen; autoplay; gamepad"
                    title="Contra 4"
                  />
                </>
              ) : (
                /* Poster Screen with Play Button */
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2a] via-[#24064a] to-[#0d021a] flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#5e3e8b]/40 border border-[#5e3e8b]/60 flex items-center justify-center text-[#dcd5e4] shadow-lg">
                    <Gamepad2 className="w-8 h-8 text-[#9080a5]" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                      Contra 4
                    </h3>
                    <p className="text-xs text-[#dcd5e4] max-w-sm">
                      Classic Konami run-and-gun arcade action. Click below to load emulator.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setContraStarted(true)}
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#5e3e8b] hover:bg-[#6e568b] active:scale-95 text-white font-bold text-sm shadow-xl transition-all cursor-pointer border border-[#9080a5]/50 group"
                  >
                    <Play className="w-4 h-4 fill-white transition-transform group-hover:scale-110" />
                    <span>Play Contra 4</span>
                  </button>

                  <div className="text-[11px] font-mono text-[#9080a5] pt-2">
                    Keyboard controls • Gamepad supported
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Game 2: Super Mario */}
        {(activeGame === 'all' || activeGame === 'mario') && (
          <section className="bg-white rounded-2xl border border-[#dfd5e8] p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#dfd5e8]">
              <div className="flex items-center space-x-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${marioStarted ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                <h2 className="font-heading font-bold text-lg sm:text-xl text-[#2e075d]">
                  Super Mario Bros
                </h2>
                <span className="text-[10px] font-mono bg-[#ede5f7] text-[#2e075d] px-2 py-0.5 rounded font-semibold border border-[#dfd5e8]">
                  Platformer
                </span>
                {marioStarted && (
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                    Running
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 self-start sm:self-auto">
                {marioStarted && (
                  <button
                    type="button"
                    onClick={() => setMarioStarted(false)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#665f6e] hover:text-[#2e075d] bg-white hover:bg-[#ede5f7] border border-[#dfd5e8] transition-colors cursor-pointer"
                    title="Stop game"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggleFullscreen('mario-container')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2e075d] bg-[#ede5f7] hover:bg-[#dfd5e8] border border-[#dfd5e8] transition-colors cursor-pointer shadow-xs"
                >
                  {fullscreenId === 'mario-container' ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-[#5e3e8b]" />
                      <span>Exit Fullscreen</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-[#5e3e8b]" />
                      <span>Fullscreen</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Responsive Container */}
            <div
              id="mario-container"
              style={{ position: 'relative', width: '100%', maxWidth: '800px', aspectRatio: '16 / 9', margin: '0 auto' }}
              className="rounded-xl overflow-hidden border border-[#dfd5e8] shadow-md bg-black relative group [&:fullscreen]:w-screen [&:fullscreen]:h-screen [&:fullscreen]:max-w-none [&:fullscreen]:rounded-none [&:fullscreen]:border-none [&:fullscreen]:aspect-auto [&:-webkit-full-screen]:w-screen [&:-webkit-full-screen]:h-screen [&:-webkit-full-screen]:max-w-none [&:-webkit-full-screen]:rounded-none [&:-webkit-full-screen]:aspect-auto"
            >
              {marioStarted ? (
                <>
                  {/* Floating Fullscreen Overlay Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleFullscreen('mario-container')}
                    className="absolute top-3 right-3 z-30 inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-black/75 hover:bg-black backdrop-blur-xs border border-white/20 transition-all opacity-85 hover:opacity-100 cursor-pointer shadow-md"
                    title={fullscreenId === 'mario-container' ? 'Exit Fullscreen (Esc)' : 'Expand Fullscreen'}
                  >
                    {fullscreenId === 'mario-container' ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span>Exit</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Fullscreen</span>
                      </>
                    )}
                  </button>

                  <iframe
                    src="https://playmario.github.io/HTML5_Client/"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allow="fullscreen; autoplay"
                    title="Super Mario Bros"
                  />
                </>
              ) : (
                /* Poster Screen with Play Button */
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e053d] via-[#2e075d] to-[#14022a] flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#5e3e8b]/40 border border-[#5e3e8b]/60 flex items-center justify-center text-[#dcd5e4] shadow-lg">
                    <Gamepad2 className="w-8 h-8 text-[#9080a5]" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
                      Super Mario Bros
                    </h3>
                    <p className="text-xs text-[#dcd5e4] max-w-sm">
                      Classic HTML5 platformer. Click below to load and start playing.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMarioStarted(true)}
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#381c59] hover:bg-[#5e3e8b] active:scale-95 text-white font-bold text-sm shadow-xl transition-all cursor-pointer border border-[#9080a5]/50 group"
                  >
                    <Play className="w-4 h-4 fill-white transition-transform group-hover:scale-110" />
                    <span>Play Super Mario</span>
                  </button>

                  <div className="text-[11px] font-mono text-[#9080a5] pt-2">
                    Controls: Arrow keys to move • S to jump • A to sprint
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

      </div>

      {/* Back to Catalogue Footer Action */}
      <div className="text-center pt-4">
        <Link
          to="/catalogue"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#5e3e8b] hover:text-[#2e075d] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to tooling catalogue</span>
        </Link>
      </div>
    </div>
  );
};