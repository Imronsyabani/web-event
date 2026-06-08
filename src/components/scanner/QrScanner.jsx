import { useEffect, useRef, useState } from 'react'
import { Form, Button, Alert } from 'react-bootstrap'
import { BrowserMultiFormatReader, BrowserCodeReader } from '@zxing/browser'

// Scanner QR berbasis kamera memakai ZXing.
// Props:
//   onResult(text) -> dipanggil saat QR terbaca
//   paused         -> jeda sementara (mis. saat menampilkan hasil)
export default function QrScanner({ onResult, paused = false }) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const controlsRef = useRef(null)
  const lastRef = useRef({ code: null, at: 0 })

  const [devices, setDevices] = useState([])
  const [deviceId, setDeviceId] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)

  // Ambil daftar kamera saat mount
  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader()
    BrowserCodeReader.listVideoInputDevices()
      .then((list) => {
        setDevices(list)
        // Utamakan kamera belakang bila ada
        const back = list.find((d) => /back|belakang|rear|environment/i.test(d.label))
        setDeviceId(back?.deviceId || list[0]?.deviceId || '')
      })
      .catch(() => setError('Tidak dapat mengakses daftar kamera.'))

    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stop = () => {
    controlsRef.current?.stop()
    controlsRef.current = null
    setScanning(false)
  }

  const start = async () => {
    setError(null)
    if (!readerRef.current) return
    try {
      controlsRef.current = await readerRef.current.decodeFromVideoDevice(
        deviceId || undefined,
        videoRef.current,
        (result) => {
          if (!result) return
          const code = result.getText()
          const now = Date.now()
          // Cegah pembacaan ganda berturut-turut dalam 2 detik
          if (lastRef.current.code === code && now - lastRef.current.at < 2000) {
            return
          }
          lastRef.current = { code, at: now }
          onResult?.(code)
        },
      )
      setScanning(true)
    } catch (err) {
      if (err?.name === 'NotAllowedError') {
        setError('Izin kamera ditolak. Aktifkan izin kamera di browser.')
      } else if (err?.name === 'NotFoundError') {
        setError('Kamera tidak ditemukan.')
      } else {
        setError('Gagal memulai kamera.')
      }
      setScanning(false)
    }
  }

  // Hentikan stream saat di-pause oleh parent
  useEffect(() => {
    if (paused && scanning) stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  return (
    <div>
      <div className="ratio ratio-1x1 bg-dark rounded overflow-hidden position-relative">
        <video
          ref={videoRef}
          className="w-100 h-100"
          style={{ objectFit: 'cover' }}
          muted
          playsInline
        />
        {!scanning && (
          <div className="position-absolute top-50 start-50 translate-middle text-center text-white-50">
            <i className="bi bi-camera-video-off" style={{ fontSize: '2.5rem' }} />
            <div className="small mt-2">Kamera nonaktif</div>
          </div>
        )}
        {scanning && (
          <div
            className="position-absolute top-50 start-50 translate-middle border border-2 border-light rounded"
            style={{ width: '60%', height: '60%', boxShadow: '0 0 0 9999px rgba(0,0,0,.25)' }}
          />
        )}
      </div>

      {error && (
        <Alert variant="danger" className="mt-3 mb-0 py-2 small">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </Alert>
      )}

      <div className="d-flex gap-2 mt-3">
        {devices.length > 1 && (
          <Form.Select
            size="sm"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            disabled={scanning}
          >
            {devices.map((d, i) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Kamera ${i + 1}`}
              </option>
            ))}
          </Form.Select>
        )}
        {!scanning ? (
          <Button variant="light" className="flex-shrink-0" onClick={start}>
            <i className="bi bi-camera-video me-1" />
            Mulai Scan
          </Button>
        ) : (
          <Button variant="outline-light" className="flex-shrink-0" onClick={stop}>
            <i className="bi bi-stop-circle me-1" />
            Stop
          </Button>
        )}
      </div>
    </div>
  )
}
