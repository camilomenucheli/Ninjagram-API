require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const router = require('./src/routes')
const path = require('path')
const morgan = require('morgan')

const PORT = process.env.APP_URL_PORT

// iniciando o App
const app = express()
app.use(express.json())
app.use(cors())
app.use(router)
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))
app.use('/files', express.static(path.resolve(__dirname, 'tmp', 'uploads')))

// Iniciando o BD
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

app.listen(PORT, () => {
  console.log(`Ninjagran listening on port ${PORT}!`)
})
