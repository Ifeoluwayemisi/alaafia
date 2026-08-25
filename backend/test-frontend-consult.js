fetch('http://localhost:5000/api/v1/consultations', {
  method:'POST', 
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    sessionId: null,
    inputType: 'TEXT',
    message: 'I have severe chest pain and difficulty breathing',
    language: 'en-NG'
  })
})
  .then(r=>r.json())
  .then(console.log)
  .catch(console.error)