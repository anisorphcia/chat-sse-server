const express = require('express')
const cors = require('cors')

const mongoose = require('mongoose')
const Message = require('./models/Message')

const app = express()

mongoose.connect('mongodb://127.0.0.1:27017/chat-sse-demo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
mongoose.connection.once('open', () => {
  console.log('✅ MongoDB 已连接')
})

app.use(cors())
app.use(express.json())

let clients = [] // 所有连接的 SSE 客户端

// 接收用户输入的接口
app.post('/api/chat/message', async (req, res) => {
  const { message } = req.body
  if (!message) {
    return res.status(400).json({ error: '消息不能为空' })
  }

  // 存储用户消息
  await Message.create({ from: 'client', message })

  // 构造服务端回复（这里直接使用原消息作为模拟回复）
  const reply = `你刚才说的是：${message}`
  reply.split('').forEach((ch, index) => {
    setTimeout(() => {
      // 向所有客户端广播
      clients.forEach(client => {
        client.res.write(`data: ${ch}\n\n`)
      })
    }, index * 150)
  })

  setTimeout(() => {
    // 存储服务端回复
    Message.create({ from: 'server', message: message })
  }, reply.length * 100 + 100)

  return res.json({ status: 'ok', message: '消息已接收' })
})

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

app.get('/api/chat/history', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 })
  res.json(messages)
})

// 打字机函数：一个字一个字地发送
function typeWriter(text, res, index = 0) {
  if (index < text.length) {
    res.write(`data: ${text[index]}\n\n`)
    setTimeout(() => {
      typeWriter(text, res, index + 1)
    }, 100)
  } else {
    res.write(`data: [DONE]\n\n`)
  }
}

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
