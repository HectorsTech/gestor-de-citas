// index.js
const express = require('express');
const bodyParser = require('body-parser');
const {
    agendarCitaAuto,
    encontrarHoraLibreEnJueves,
    verificarDisponibilidad,
    agendarCitaConHoraFija
  } = require('./calendar');
  


const sesiones = {}; // key: session ID, value: { nombre, correo, propuestaHora }


const app = express();
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const intent = req.body.queryResult.intent.displayName;
    const fullSession = req.body.session;
    const session = fullSession.split('/').pop(); // solo la parte final

    const params = req.body.queryResult.parameters;
  
    console.log('INTENT:', intent);
    console.log('SESSION:', session);
    console.log('PARAMS:', params);

    console.log('Intent detectado:', intent); // te ayuda a confirmar siempre el nombre exacto

  
    if (intent.toLowerCase() === 'agendar cita') {
        const nombre = (params.nombre || '').trim();
  
      const slot = await encontrarHoraLibreEnJueves(); // nueva función
      sesiones[session] = { nombre, propuestaHora: slot };
  
      const fechaLegible = new Date(slot.start).toLocaleString('es-MX');
      return res.json({
        fulfillmentText: `Hola ${nombre}, tengo una cita disponible el jueves a las ${fechaLegible}. ¿Te viene bien esa hora?`,
      });
    }
  
    if (intent.toLowerCase() === 'confirmar hora') {
      const sesion = sesiones[session];
      if (!sesion) {
        return res.json({ fulfillmentText: 'No tengo una hora propuesta aún. ¿Quieres agendar una cita?' });
      }
  
      const result = await agendarCitaAuto(sesion.nombre);
  
      delete sesiones[session];
  
      return res.json({
        fulfillmentText: `¡Perfecto! Tu cita quedó agendada para el ${new Date(result.start).toLocaleString('es-MX')}.`,
      });
    }
  
    if (intent.toLowerCase() === 'rechazar hora') {
      return res.json({
        fulfillmentText: 'Entiendo. ¿Qué hora te vendría mejor entre 5:00 pm y 10:00 pm del jueves?',
      });
    }
  
    if (intent.toLowerCase() === 'desviar humano') {
      return res.json({
        fulfillmentText: '¡Perfecto! Te pondré en contacto con Héctor en unos momentos 😊',
      });
    }

    if (intent.toLowerCase() === 'proponer hora alterna') {
        const horaTexto = params.hora;
        const sesion = sesiones[session];
      
        if (!sesion) {
          return res.json({
            fulfillmentText: 'Parece que no habíamos iniciado una cita. ¿Quieres comenzar a agendar una entrevista?',
          });
        }
      
        const ahora = new Date();
        const diaActual = ahora.getDay();
        const diasHastaJueves = (4 - diaActual + 7) % 7;
        const jueves = new Date(ahora);
        jueves.setDate(ahora.getDate() + diasHastaJueves);
      
        const [hora, minutos] = horaTexto.split(':');
        jueves.setHours(Number(hora));
        jueves.setMinutes(Number(minutos));
        jueves.setSeconds(0);
      
        const inicio = new Date(jueves);
        const fin = new Date(jueves);
        fin.setMinutes(inicio.getMinutes() + 30);
      
        const libre = await verificarDisponibilidad(inicio, fin);
      
        if (!libre) {
          return res.json({
            fulfillmentText: 'Esa hora ya está ocupada. ¿Quieres intentar con otra dentro de 5:00 pm a 10:00 pm del jueves?',
          });
        }
      
        await agendarCitaConHoraFija(sesion.nombre, inicio, fin);
        delete sesiones[session];
      
        return res.json({
          fulfillmentText: `¡Listo! Te agendé la cita para el jueves a las ${inicio.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}.`,
        });
      }
      

    
  
    return res.json({ fulfillmentText: 'No entendí lo que necesitas 😅' });
  });
  

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));
