import { useState } from "react";
import { Button } from "../components/ui/button";
import { useRef } from "react";
import { Navigate, useParams } from "react-router-dom";

const isRecordingSupported = !!navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' && typeof window.MediaRecorder === 'function'

type RoomParams = {
  roomId: string
}

export function RecordRoomAudio() {
  const params = useParams<RoomParams>()

  const [isRecording, setIsRecording] = useState(false)
  const recorder = useRef<MediaRecorder | null>(null)

  if (!params.roomId) return <Navigate replace to='/' />

  async function startRecording() {
    if (!isRecordingSupported) return

    setIsRecording(true)

    const audio = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44_100
      }
    })

    recorder.current = new MediaRecorder(audio, {
      mimeType: 'audio/webm',
      audioBitsPerSecond: 64000,
    })

    recorder.current.ondataavailable = event => {
      if (event.data.size > 0) {
        uploadAudio(event.data);
      }
    }

    recorder.current.onstart = () => {
      console.log('record started');
    }

    recorder.current.onstop = () => {
      console.log('record stopped');
    }

    recorder.current.start()
  }

  function stopReording() {
    setIsRecording(false)

    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.stop()
    }
  }

  async function uploadAudio(data: Blob) {
    const formData = new FormData()

    formData.append('file', data, 'audio.webm')

    const response = fetch(`http://localhost:3333/rooms/${params.roomId}/audio`, {
      method: 'POST',
      body: formData
    })

    const result = (await response).json()

    console.log(result);
  }

  return (
    <div className="h-screen flex items-center justify-center flex-col gap-3">
      {isRecording ? <Button onClick={stopReording}>Pausar gravação</Button> : <Button onClick={startRecording}>Gravar áudio</Button>}
      {isRecording ? <p>Gravando . . .</p> : <p>Pausado</p>}
    </div>
  )
}
