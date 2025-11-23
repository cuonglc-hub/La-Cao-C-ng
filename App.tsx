import React, { useState } from 'react';
import { UploadZone } from './components/UploadZone';
import { Button } from './components/Button';
import { UploadedFile, ProcessingStatus } from './types';
import { swapCharacterInThumbnail } from './services/gemini';

const App: React.FC = () => {
  const [thumbFile, setThumbFile] = useState<UploadedFile | null>(null);
  const [charFile, setCharFile] = useState<UploadedFile | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!thumbFile || !charFile) return;

    setStatus(ProcessingStatus.PROCESSING);
    setErrorMessage(null);
    setResultImage(null);

    try {
      const resultBase64 = await swapCharacterInThumbnail(
        thumbFile.base64,
        charFile.base64,
        thumbFile.file.type,
        charFile.file.type
      );
      setResultImage(resultBase64);
      setStatus(ProcessingStatus.SUCCESS);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "An unexpected error occurred during generation.");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white selection:bg-primary-500/30">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d1117]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">ThumbSwap<span className="text-primary-500">AI</span></span>
          </div>
          <div className="text-sm text-gray-400 hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Intro */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Remix Your Thumbnails Instantly
          </h1>
          <p className="text-gray-400 text-lg">
            Upload an existing thumbnail and a new character portrait. We'll swap the person while keeping your text and layout intact.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">
          
          {/* Left Column: Inputs */}
          <div className="space-y-8">
            <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-xs text-white">1</span>
                Source Inputs
              </h2>
              
              <div className="space-y-6">
                <UploadZone
                  label="Original Thumbnail"
                  subLabel="Upload 19:9 or 16:9 Thumbnail"
                  fileData={thumbFile}
                  onFileSelect={setThumbFile}
                  onClear={() => setThumbFile(null)}
                  aspectRatioClass="aspect-[19/9]" // Explicit request from user, though standard is 16:9
                />

                <div className="relative">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 hidden lg:block">
                    <div className="h-16 w-0.5 bg-gray-700"></div>
                  </div>
                </div>

                <UploadZone
                  label="New Character"
                  subLabel="Upload Portrait Photo"
                  fileData={charFile}
                  onFileSelect={setCharFile}
                  onClear={() => setCharFile(null)}
                  aspectRatioClass="aspect-[3/4]"
                />
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700/50">
                 <Button 
                   onClick={handleGenerate} 
                   isLoading={status === ProcessingStatus.PROCESSING}
                   className="w-full text-lg shadow-primary-500/25"
                   disabled={!thumbFile || !charFile}
                 >
                    Generate New Thumbnail
                 </Button>
                 {errorMessage && (
                   <div className="mt-4 p-4 rounded-xl bg-red-900/20 border border-red-800 text-red-200 text-sm">
                     <strong>Error:</strong> {errorMessage}
                   </div>
                 )}
              </div>
            </div>
            
            {/* Instruction Tip */}
            <div className="bg-blue-900/10 border border-blue-900/30 rounded-xl p-4 flex gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-300">
                For best results, ensure the new character photo has good lighting. The AI will attempt to match the lighting of the original thumbnail automatically.
              </p>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="space-y-4">
            <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-6 sm:p-8 h-full min-h-[500px] flex flex-col shadow-2xl relative overflow-hidden">
               <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 relative z-10">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-xs text-white">2</span>
                Result
              </h2>

              <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                {status === ProcessingStatus.SUCCESS && resultImage ? (
                  <div className="w-full animate-fade-in space-y-4">
                    <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-700 group relative">
                       <img 
                         src={resultImage} 
                         alt="Generated Thumbnail" 
                         className="w-full h-auto object-cover"
                       />
                    </div>
                    <div className="flex gap-3">
                       <a 
                         href={resultImage} 
                         download="new_thumbnail.png"
                         className="flex-1 text-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 rounded-xl transition-colors"
                       >
                         Download Image
                       </a>
                       <button 
                         onClick={() => {
                           setResultImage(null);
                           setStatus(ProcessingStatus.IDLE);
                         }}
                         className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl transition-colors text-gray-300"
                       >
                         Discard
                       </button>
                    </div>
                  </div>
                ) : status === ProcessingStatus.PROCESSING ? (
                  <div className="text-center space-y-4">
                     <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
                     </div>
                     <h3 className="text-lg font-medium text-white">Generating Magic...</h3>
                     <p className="text-sm text-gray-400 max-w-xs mx-auto">
                       The AI is analyzing the layout, preserving the text, and blending in your new character.
                     </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-600 space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gray-800/50 flex items-center justify-center border border-gray-700 border-dashed">
                      <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p>Your generated thumbnail will appear here.</p>
                  </div>
                )}
              </div>

              {/* Decorative background blurs */}
              <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;