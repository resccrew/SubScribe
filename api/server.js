import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Supabase-клиент
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

// Получение всех подписок для пользователя
app.get('/api/subscriptions/:userId', async (req, res) => {
  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('billing_date', { ascending: true });

    if (error) throw error;
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Добавление новой подписки
app.post('/api/subscriptions', async (req, res) => {
  try {
    const { userId, name, price, billingDate, serviceLogo } = req.body;
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{ 
        user_id: userId, 
        name, 
        price, 
        billing_date: billingDate, 
        service_logo: serviceLogo 
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// Обновление подписки
app.put('/api/subscriptions/:id', async (req, res) => {
  try {
    const { name, price, billingDate, serviceLogo } = req.body;
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ 
        name, 
        price, 
        billing_date: billingDate, 
        service_logo: serviceLogo 
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Удаление подписки
app.delete('/api/subscriptions/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});