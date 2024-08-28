import { useEffect, useState } from "react";
import ActiveCallDetail from "./components/ActiveCallDetail";
import Button from "./components/base/Button";
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "./utils";

// Put your Vapi Public Key below.
const vapi = new Vapi("ae2bfc9f-1cba-417b-9783-fd0536f228f7");

const App = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const [error, setError] = useState(null);

  // hook into Vapi events
  useEffect(() => {
    // Check if audio is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Audio is not supported in this environment");
      return;
    }

    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);

    });

    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);

    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAssistantIsSpeaking(false);
    });

    vapi.on("volume-level", (level) => {
      setVolumeLevel(level);
    });

    vapi.on("error", (error) => {
      console.error(error);
      setError(error.message || "An error occurred");
      setConnecting(false);
    });

    // we only want this to fire on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCallInline = async () => {
    setConnecting(true);
    setError(null);
    try {
      // Check if we can access the microphone
      await navigator.mediaDevices.getUserMedia({ audio: true });
      vapi.start("deaa8946-9c01-4a8c-a917-0243d2af3bc2");
    } catch (err) {
      console.error(err);
      setError("Failed to access microphone. Please check your audio settings.");
      setConnecting(false);
    }
  };

  const endCall = () => {
    vapi.stop();
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {!connected ? (
        <Button
          label="Call"
          onClick={startCallInline}
          isLoading={connecting}
          disabled={!!error}
        />
      ) : (
        <ActiveCallDetail
          assistantIsSpeaking={assistantIsSpeaking}
          volumeLevel={volumeLevel}
          onEndCallClick={endCall}
        />
      )}
    </div>
  );
};

export default App;
