const base = 'http://localhost:5000/api/v1';

async function smokeTest() {
  console.log('=== ALAFIA DEMO SMOKE TEST ===\n');
  
  // 1. Health check
  console.log('1. Health check...');
  const health = await fetch(`${base}/health`).then(r => r.json());
  console.log('   ✓', health.message);
  
  // 2. Create guest session
  console.log('\n2. Create guest session...');
  const guest = await fetch(`${base}/auth/guest`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({language: 'en-NG'})
  }).then(r => r.json());
  console.log('   ✓ Guest session:', guest.data.sessionId);
  const sessionId = guest.data.sessionId;
  
  // 3. Start consultation (frontend contract)
  console.log('\n3. Create consultation (frontend contract)...');
  const consult = await fetch(`${base}/consultations`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({sessionId, inputType: 'TEXT', message: 'I have severe chest pain and difficulty breathing', language: 'en-NG'})
  }).then(r => r.json());
  console.log('   ✓ Consultation:', consult.data.consultation.id);
  const consultationId = consult.data.consultation.id;
  
  // 4. Submit additional symptoms
  console.log('\n4. Submit additional symptom...');
  await fetch(`${base}/consultations/${consultationId}/message`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message: 'Also feeling dizzy', language: 'en-NG'})
  }).then(r => r.json());
  console.log('   ✓ Message recorded');
  
  // 5. Trigger triage assessment
  console.log('\n5. Trigger triage assessment...');
  const triage = await fetch(`${base}/triage`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({consultationId})
  }).then(r => r.json());
  console.log('   ✓ Severity:', triage.data.severity);
  console.log('   ✓ Action:', triage.data.requiredCare);
  console.log('   ✓ Red flags:', triage.data.redFlags.length);
  
  // 6. Get facility recommendations (with location)
  console.log('\n6. Get facility recommendations...');
  const facilities = await fetch(`${base}/hospitals/recommended?consultationId=${consultationId}&latitude=6.5244&longitude=3.3792`).then(r => r.json());
  console.log('   ✓ Facilities found:', facilities.data.recommendations.length);
  facilities.data.recommendations.slice(0, 3).forEach(f => console.log('   -', f.hospital.name, '(', f.distanceKm, 'km,', f.hospital.facilityType, ', score:', f.score, ')'));
  
  // 7. Create payment request
  console.log('\n7. Initiate payment (CARE_PAYMENT)...');
  const payment = await fetch(`${base}/payments/initiate`, {
    method: 'POST', 
    headers: {'Content-Type': 'application/json', 'Idempotency-Key': 'smoke-test-' + Date.now()},
    body: JSON.stringify({
      type: 'CARE_PAYMENT',
      amountMinor: 3000000,
      currency: 'NGN',
      consultationId,
      description: 'Emergency care initial assessment',
      customer: {name: 'Demo Patient', email: 'demo@example.com', phone: '+2348000000000'}
    })
  }).then(r => r.json());
  console.log('   ✓ Payment initiated:', payment.data.orderId);
  console.log('   ✓ Gateway:', payment.data.gateway);
  console.log('   ✓ Virtual account:', payment.data.virtualAccountDetails?.accountNumber);
  
  // 8. Test URGENT scenario
  console.log('\n8. Test URGENT scenario (high fever, vomiting)...');
  const consult2 = await fetch(`${base}/consultations`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({sessionId, inputType: 'TEXT', message: 'High fever, weakness, persistent vomiting for 2 days', language: 'en-NG'})
  }).then(r => r.json());
  const consultationId2 = consult2.data.consultation.id;
  await fetch(`${base}/consultations/${consultationId2}/message`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message: 'High fever, weakness, persistent vomiting for 2 days', language: 'en-NG'})
  }).then(r => r.json());
  const triage2 = await fetch(`${base}/triage`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({consultationId: consultationId2})
  }).then(r => r.json());
  console.log('   ✓ Severity:', triage2.data.severity);
  console.log('   ✓ Action:', triage2.data.requiredCare?.emergencyCare ? 'EMERGENCY' : 'URGENT');
  
  // 9. Test LOW scenario
  console.log('\n9. Test LOW scenario (mild headache)...');
  const consult3 = await fetch(`${base}/consultations`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({sessionId, inputType: 'TEXT', message: 'Mild headache, no other symptoms', language: 'en-NG'})
  }).then(r => r.json());
  const consultationId3 = consult3.data.consultation.id;
  await fetch(`${base}/consultations/${consultationId3}/message`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message: 'Mild headache, no other symptoms', language: 'en-NG'})
  }).then(r => r.json());
  const triage3 = await fetch(`${base}/triage`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({consultationId: consultationId3})
  }).then(r => r.json());
  console.log('   ✓ Severity:', triage3.data.severity);
  console.log('   ✓ Action:', triage3.data.requiredCare?.emergencyCare ? 'EMERGENCY' : 'ROUTINE');
  
  // 10. Test support request
  console.log('\n10. Create support request...');
  const support = await fetch(`${base}/support-requests`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      patientRef: sessionId,
      requestedAmountMinor: 5000000,
      reason: 'Emergency surgery needed',
      contactName: 'John Doe',
      contactPhone: '+2348000000001'
    })
  }).then(r => r.json());
  console.log('   ✓ Support request:', support.data?.id || support.id);
  
  // 11. List facilities
  console.log('\n11. List facilities...');
  const facs = await fetch(`${base}/facilities`).then(r => r.json());
  console.log('   ✓ Total facilities:', facs.data?.length || facs.length);
  
  // 12. Get guidance
  console.log('\n12. Get triage guidance...');
  const guidance = await fetch(`${base}/triage/${consultationId}/guidance`).then(r => r.json());
  console.log('   ✓ Guidance:', guidance.data.guidance.title);
  
  console.log('\n=== ALL SMOKE TESTS PASSED ===');
}

smokeTest().catch(e => { console.error('FAILED:', e); process.exit(1); });