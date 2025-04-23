const { google } = require('googleapis');
const credentials = require('./credentials.json'); // archivo descargado de Google Cloud
require('dotenv').config();


const oAuth2Client = new google.auth.OAuth2(
  credentials.installed.client_id,
  credentials.installed.client_secret,
  credentials.installed.redirect_uris[0]
);

// Coloca aquí el refresh token que generaste con get-token.js
oAuth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
});

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

if (!credentials || !credentials.installed || !credentials.installed.client_id) {
    throw new Error('❌ Error: Archivo de credenciales no válido');
  }

async function encontrarHoraLibreEnJueves() {
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
  
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 14); // buscar en las siguientes 2 semanas
  
    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin: now.toISOString(),
        timeMax: end.toISOString(),
        timeZone: 'America/Mexico_City',
        items: [{ id: 'primary' }],
      },
    });
  
    const busy = res.data.calendars.primary.busy;
    let current = new Date(now);
  
    current.setDate(current.getDate() + ((4 - current.getDay() + 7) % 7)); // próximo jueves
    current.setHours(17, 0, 0, 0); // 5:00 pm
  
    const endHour = 22; // 10:00 pm
  
    while (current < end) {
      const next = new Date(current);
      next.setMinutes(next.getMinutes() + 30); // cita de 30 mins
  
      const isBusy = busy.some(slot =>
        new Date(slot.start) < next && new Date(slot.end) > current
      );
  
      if (!isBusy && current.getHours() >= 17 && next.getHours() <= endHour) {
        return { start: current.toISOString(), end: next.toISOString() };
      }
  
      current.setMinutes(current.getMinutes() + 30);
      if (current.getHours() >= endHour) {
        // avanzar al siguiente jueves
        current.setDate(current.getDate() + 7);
        current.setHours(17, 0, 0, 0);
      }
    }
  
    throw new Error('No hay disponibilidad en los próximos jueves');
  }
  

  async function agendarCitaAuto(nombre) {
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const slot = await encontrarHoraLibreEnJueves();
  
    const evento = {
      summary: `Entrevista con ${nombre}`,
      start: { dateTime: slot.start, timeZone: 'America/Mexico_City' },
      end: { dateTime: slot.end, timeZone: 'America/Mexico_City' },
      description: `Agendado por ${nombre}`
,
    };
  
    await calendar.events.insert({
      auth: oAuth2Client,
      calendarId: 'primary',
      resource: evento,
    });
  
    return slot;
  }
  

async function verificarDisponibilidad(start, end) {
  const resBusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      timeZone: 'America/Mexico_City',
      items: [{ id: 'primary' }],
    },
  });

  return resBusy.data.calendars.primary.busy.length === 0;
}

async function agendarCitaConHoraFija(nombre, start, end) {
  const evento = {
    summary: `Entrevista con ${nombre}`,
    start: { dateTime: start.toISOString(), timeZone: 'America/Mexico_City' },
    end: { dateTime: end.toISOString(), timeZone: 'America/Mexico_City' },
    description: `Agendado por ${nombre}`
,
  };

  await calendar.events.insert({
    auth: oAuth2Client,
    calendarId: 'primary',
    resource: evento,
  });

  return evento;
}


  

module.exports = { 
    calendar,
    agendarCitaAuto,
  encontrarHoraLibreEnJueves,
  verificarDisponibilidad,
  agendarCitaConHoraFija
};
