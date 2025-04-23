# gestor-de-citas

# 🤖 Gestor de Citas Automatizado con WhatsApp y Google Calendar

![Flujo del bot](./docs/flujo-bot.png)

> Automatiza la programación de entrevistas desde WhatsApp usando Dialogflow y Google Calendar. Ideal para empresas, recruiters o proyectos personales.

---

## 🧪 Badges

![Node](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)
![Dialogflow](https://img.shields.io/badge/Dialogflow-ES-orange?logo=dialogflow)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![MadeWithLove](https://img.shields.io/badge/Made%20with-%E2%9D%A4-red)

---

## 📌 Características

- ✅ Detecta cuándo un usuario quiere agendar una cita
- 📅 Sugiere automáticamente la siguiente hora disponible (jueves de 5:00 pm a 10:00 pm)
- 🔄 Permite aceptar o proponer una hora diferente
- 📆 Agenda en Google Calendar con validación real
- 🔐 Usa `.env` y `credentials.json` seguros
- 🤖 Redirige al humano si el flujo no es de citas

---

## 🛠️ Tecnologías

- Node.js + Express
- Dialogflow ES
- Google Calendar API
- Ngrok
- Dotenv

---

## 🚀 Instalación local

```bash
git clone https://github.com/HectorsTech/gestor-de-citas.git
cd gestor-de-citas
npm install
