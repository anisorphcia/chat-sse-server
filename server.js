const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

let clients = [] // 所有连接的 SSE 客户端

// 接收用户输入的接口
app.post('/api/chat/message', (req, res) => {
  const { message } = req.body
  if (!message) {
    return res.status(400).json({ error: '消息不能为空' })
  }

  // 通知所有 SSE 客户端开始推送打字机效果
  clients.forEach(client => {
    typeWriter(message, client.res)
  })

  return res.json({ status: 'ok', message: '消息已接收' })
})

// SSE 接口
app.get('/api/chat/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const client = { res }
  clients.push(client)

  req.on('close', () => {
    clients = clients.filter(c => c !== client)
  })
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
