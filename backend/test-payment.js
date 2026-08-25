fetch('http://localhost:5000/api/v1/payments/initiate', {
  method:'POST', 
  headers:{'Content-Type':'application/json', 'Idempotency-Key':'test-key-12345'},
  body:JSON.stringify({
    type:'CARE_PAYMENT',
    amountMinor: 3000000,
    currency:'NGN',
    consultationId:'9e925f72-4ab8-4dab-ab56-cbb113bd1e2b',
    description:'Emergency care initial assessment',
    customer:{ name:'Test Patient', email:'test@example.com', phone:'+2348000000000' }
  })
})
  .then(r=>r.json())
  .then(console.log)
  .catch(console.error)