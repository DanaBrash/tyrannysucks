import React, { useRef, useState } from 'react'
export default function ContactForm(){const formRef=useRef(null);const [status,setStatus]=useState('');
const sendEmail=async(e)=>{e.preventDefault();setStatus('Sending...');const form=new FormData(formRef.current);
const body={from_name:form.get('from_name')||'', reply_to:form.get('reply_to')||'', new_mail:form.get('new_mail')||'', message:form.get('message')||''};
try{const API_BASE=import.meta.env.VITE_API_BASE||'';const res=await fetch(`${API_BASE}/api/sendmail`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
if(!res.ok) throw new Error(await res.text().catch(()=>res.statusText)); setStatus('Sent!'); formRef.current?.reset();}catch(err){console.error(err); setStatus('Failed: '+(err.message||'unknown'));}};
return(<form ref={formRef} onSubmit={sendEmail} style={{display:'grid',gap:12}}>
<div><label htmlFor='from_name'>Your name</label><input id='from_name' name='from_name' required /></div>
<div><label htmlFor='reply_to'>Your email</label><input id='reply_to' name='reply_to' type='email' required /></div>
<div><label htmlFor='new_mail'>Recipient</label><input id='new_mail' name='new_mail' type='email' required /></div>
<div><label htmlFor='message'>Message</label><textarea id='message' name='message' required /></div>
<button type='submit'>Send</button><div className='status'>{status}</div></form>) }