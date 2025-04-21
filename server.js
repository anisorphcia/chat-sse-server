const express = require('express')
const cors = require('cors')

const mongoose = require('mongoose')
const Message = require('./models/Message')

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://127.0.0.1:27017/chat-sse-demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
mongoose.connection.once('open', () => {
  console.log('✅ MongoDB 已连接')
})

let clients = [] // 所有连接的 SSE 客户端

// SSE 接口
app.get('/api/chat/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const clientId = Date.now()
  const newClient = {
    id: clientId,
    res,
  }
  clients.push(newClient)

  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId)
  })
})

// 接收用户输入的接口
app.post('/api/chat/message', async (req, res) => {
  const { message, userId, timestamp } = req.body
  if (!message || !userId) {
    return res.status(400).json({ error: '缺少 用户ID 或 消息' })
  }

  // 存储用户消息
  await Message.create({ message, userId, timestamp })

  // 向所有客户端广播整条消息
  const payload = JSON.stringify({ message, userId, timestamp })
  clients.forEach(client => {
    client.res.write(`data: ${payload}\n\n`)
  })

  return res.json({ status: 'ok', message: '消息已接收' })
})

app.get('/api/chat/history', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 })
  res.json(messages)
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
