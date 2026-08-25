fetch('http://localhost:5000/api/v1/consultations/start', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({language:'en-NG'})})
  .then(r=>r.json())
  .then(c=>fetch('http://localhost:5000/api/v1/consultations/'+c.consultationId+'/submit', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({input:'I have severe chest pain and difficulty breathing', language:'en-NG', age:45, isPregnant:false, chronicDiseases:[]})}))
  .then(r=>r.json())
  .then(async c => {
    console.log('Triage:', c.triageResult.severity);
    const costRes = await fetch('http://localhost:5000/api/v1/care-cost/estimate', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({serviceCodes:['EMERGENCY_CARE_INITIAL', 'LABORATORY_BASIC', 'IMAGING_XRAY', 'ADMISSION_WARD_DAILY']})});
    const cost = await costRes.json();
    console.log('Cost estimate:', cost);
  })
  .catch(console.error)