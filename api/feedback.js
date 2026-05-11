const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzt4r4hSbr42bK8Uxy88CBX1GmX6fBfO1OvPfbM8nIcNiNrMks_kHadtknnspAlvbFhlA/exec'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const params = new URLSearchParams(req.query)
    const response = await fetch(`${SCRIPT_URL}?${params}`)
    const data = await response.json()
    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message })
  }
}
