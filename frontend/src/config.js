/**
 * Base URL for the Sarvam TeleHealth / speech-recognition video call app.
 * Set VITE_TELEHEALTH_URL in .env (e.g. http://localhost:3000) to override.
 */
export const TELEHEALTH_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TELEHEALTH_URL) ||
  'http://localhost:3000'

/**
 * Doctor-only link: opens Sarvam TeleHealth as "Join as Doctor" (role=doctor).
 * Used only when the doctor clicks Accept Call — same speech-to-text / live preview as in speech-recognition.
 */
export function getTelehealthDoctorRoomUrl(requestId, doctorName) {
  const base = TELEHEALTH_BASE_URL.replace(/\/$/, '')
  const name = encodeURIComponent(doctorName || 'Doctor')
  return `${base}/room/${encodeURIComponent(requestId)}?role=doctor&userName=${name}`
}

/**
 * ASHA / patient-only link: opens Sarvam TeleHealth as "Join as Patient" (role=patient).
 * Prefer using invite_link from API (GET video-call-requests/worker/...) when available — that is the link sent as response to Arogya Sethu when the doctor accepts.
 */
export function getTelehealthPatientRoomUrl(requestId, userName) {
  const base = TELEHEALTH_BASE_URL.replace(/\/$/, '')
  const name = encodeURIComponent(userName || 'ASHA Worker')
  return `${base}/room/${encodeURIComponent(requestId)}?role=patient&userName=${name}`
}
