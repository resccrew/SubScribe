import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { ObjectId } from 'mongodb'
import clientPromise from './config/mongodb.ts'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Получить все подписки пользователя
app.get('/api/subscriptions/:userId', async (req, res) => {
  try {
    const client = await clientPromise
    const db = client.db('subscribe')
    const collection = db.collection('subscriptions')
    
    const subscriptions = await collection
      .find({ userId: req.params.userId })
      .sort({ billingDate: 1 })
      .toArray()
    
    res.json(subscriptions)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    res.status(500).json({ error: 'Failed to fetch subscriptions' })
  }
})

// Создать новую подписку
app.post('/api/subscriptions', async (req, res) => {
  try {
    const client = await clientPromise
    const db = client.db('subscribe')
    const collection = db.collection('subscriptions')
    
    const subscription = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(subscription)
    res.json({ id: result.insertedId, ...subscription })
  } catch (error) {
    console.error('Error creating subscription:', error)
    res.status(500).json({ error: 'Failed to create subscription' })
  }
})

// Обновить подписку
app.put('/api/subscriptions/:id', async (req, res) => {
  try {
    const client = await clientPromise
    const db = client.db('subscribe')
    const collection = db.collection('subscriptions')
    
    const { id } = req.params
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Subscription not found' })
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error updating subscription:', error)
    res.status(500).json({ error: 'Failed to update subscription' })
  }
})

// Удалить подписку
app.delete('/api/subscriptions/:id', async (req, res) => {
  try {
    const client = await clientPromise
    const db = client.db('subscribe')
    const collection = db.collection('subscriptions')
    
    const { id } = req.params
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Subscription not found' })
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    res.status(500).json({ error: 'Failed to delete subscription' })
  }
})

// Получить статистику по подпискам
app.get('/api/subscriptions/:userId/stats', async (req, res) => {
  try {
    const client = await clientPromise
    const db = client.db('subscribe')
    const collection = db.collection('subscriptions')
    
    const stats = await collection.aggregate([
      { $match: { userId: req.params.userId } },
      {
        $group: {
          _id: null,
          totalMonthly: {
            $sum: {
              $cond: [{ $eq: ['$cycle', 'monthly'] }, '$price', 0]
            }
          },
          totalYearly: {
            $sum: {
              $cond: [{ $eq: ['$cycle', 'yearly'] }, '$price', 0]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]).toArray()
    
    res.json(stats[0] || { totalMonthly: 0, totalYearly: 0, count: 0 })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// Categories API

// Get all categories for a user
app.get('/api/categories/:userId', async (req, res) => {
  try {
    const client = await clientPromise
    const db = client.db('subscribe')
    const collection = db.collection('categories')
    
    const categories = await collection
      .find({ userId: req.params.userId })
      .sort({ name: 1 })
      .toArray()
    
    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// Create a new category
app.post('/api/categories', async (req, res) => {
  try {
    const client = await clientPromise
    const db = client.db('subscribe')
    const collection = db.collection('categories')
    
    const category = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(category)
    res.json({ id: result.insertedId, ...category })
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// Delete a category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const client = await clientPromise
    const db = client.db('subscribe')
    const collection = db.collection('categories')
    
    const { id } = req.params
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

// Serve built frontend (after API routes)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.resolve(__dirname, '../dist')
app.use(express.static(distPath))
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})