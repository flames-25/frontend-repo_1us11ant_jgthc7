import { useEffect, useMemo, useState } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

function Section({ title, children }){
  return (
    <div className="bg-white/80 backdrop-blur rounded-xl shadow p-5 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">{title}</h2>
      {children}
    </div>
  )
}

function App() {
  const [health, setHealth] = useState(null)
  const [patients, setPatients] = useState([])
  const [triageResp, setTriageResp] = useState(null)
  const [assignment, setAssignment] = useState(null)
  const [payroll, setPayroll] = useState(null)

  const api = useMemo(() => ({
    async get(path){
      const res = await fetch(`${BACKEND_URL}${path}`)
      return res.json()
    },
    async post(path, body){
      const res = await fetch(`${BACKEND_URL}${path}`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body)
      })
      return res.json()
    }
  }),[])

  useEffect(() => {
    api.get('/test').then(setHealth).catch(()=>setHealth({backend:'error'}))
  }, [api])

  async function seedDemo(){
    const p = await api.post('/patients',{
      national_mrn: 'IDN-0001',
      full_name: 'Budi Santoso',
      birth_date: new Date().toISOString(),
      gender: 'male',
      category: 'telemedis',
      service_type: 'UGD',
      emergency_contacts:[{name:'Ibu Budi', phone:'081234'}],
      allergies:['penicillin']
    })
    const list = await api.get('/patients')
    setPatients(list)

    const tri = await api.post('/triage',{
      patient_id: p.id,
      esi_level: 2,
      gcs: 7,
      vitals: {SpO2: 88, HR:120},
      critical_allergy:false
    })
    setTriageResp(tri)

    const assign = await api.get('/assignments/recommend?room_class=VIP')
    setAssignment(assign)

    const pr = await api.post('/payroll/calc',{
      staff_id: 'D001', month: '2025-11', presence_days: 20,
      tindakan_langsung: 10, tindakan_asistensi: 5, insentif_igd: 4,
      insentif_icu: 2, insentif_isolasi: 3, bonus_klaim_bpjs: 6
    })
    setPayroll(pr)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">RSUD XYZ – Hospital 4.0 Dashboard</h1>
            <p className="text-gray-500 text-sm">Platform terpadu: pasien, triage, IoT, farmasi, payroll, integrasi</p>
          </div>
          <button onClick={seedDemo} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700">
            Jalankan Demo Alur
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Kesehatan Layanan">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{health ? JSON.stringify(health,null,2) : 'Memuat...'}</pre>
          </Section>

          <Section title="Rekomendasi Penugasan (VIP)">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{assignment ? JSON.stringify(assignment,null,2) : 'Klik Demo'}</pre>
          </Section>

          <Section title="Daftar Pasien">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{patients.length ? JSON.stringify(patients,null,2) : 'Belum ada data'}</pre>
          </Section>

          <Section title="Triage Terakhir">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{triageResp ? JSON.stringify(triageResp,null,2) : 'Klik Demo'}</pre>
          </Section>

          <Section title="Payroll Hitung Cepat">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{payroll ? JSON.stringify(payroll,null,2) : 'Klik Demo'}</pre>
          </Section>
        </div>
      </div>
    </div>
  )
}

export default App
