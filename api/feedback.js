const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzt4r4hSbr42bK8Uxy88CBX1GmX6fBfO1OvPfbM8nIcNiNrMks_kHadtknnspAlvbFhlA/exec'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const params = new URLSearchParams(req.query)
    await fetch(`${SCRIPT_URL}?${params}`)
    // Don't parse the Apps Script response — content-type after the redirect
    // chain is unreliable. If fetch didn't throw, the request reached the script.
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message })
  }
}
