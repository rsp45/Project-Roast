import { UploadPanel } from "./UploadPanel";

export default function UploadPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] relative w-full">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-container/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      <div className="max-w-[800px] w-full z-10 flex flex-col gap-stack-lg">
        <div className="text-center mb-stack-md">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-sm tracking-tight">Initiate Interrogation</h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl mx-auto leading-relaxed">
            Upload your trade logs. The AI will dissect your strategy, identify weaknesses, and expose critical errors with surgical precision.
          </p>
        </div>
        <UploadPanel />
      </div>
    </div>
  );
}
