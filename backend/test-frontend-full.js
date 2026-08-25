// Test full frontend flow: create consultation -> voice -> confirm -> triage
const base = 'http://localhost:5000/api/v1/consultations';

async function testFlow() {
  // 1. Create consultation with text
  const createRes = await fetch(base, {
    method:'POST', 
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({inputType:'TEXT', message:'I have severe chest pain and difficulty breathing', language:'en-NG'})
  });
  const createData = await createRes.json();
  console.log('1. Created:', createData.data.consultation.id);
  const id = createData.data.consultation.id;

  // 2. Submit message (continue consultation)
  const msgRes = await fetch(`${base}/${id}/message`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({message:'I have severe chest pain and difficulty breathing', language:'en-NG'})
  });
  const msgData = await msgRes.json();
  console.log('2. Message:', msgData.data.nextStep.type);

  // 3. Now check the consultation details to see triage
  const getRes = await fetch(`${base}/${id}`);
  const getData = await getRes.json();
  console.log('3. Consultation:', getData.consultation.status, getData.consultation.extractedSymptoms);
}

testFlow().catch(console.error);