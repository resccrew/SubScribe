import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';






const app = express();
const port = process.env.PORT || 8000;

// Supabase-клиент
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const useMock = !supabaseUrl || !supabaseKey;
const supabase = !useMock ? createClient(supabaseUrl, supabaseKey) : null;
const mock = { subscriptions: [] };

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Получение всех подписок для пользователя
app.get('/subscriptions/:userId', async (req, res) => {
  try {
    if (useMock) {
      const list = mock.subscriptions.filter(s => s.user_id === req.params.userId);
      list.sort((a, b) => new Date(a.billing_date) - new Date(b.billing_date));
      res.json(list);
      return;
    }
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('billing_date', { ascending: true });
    if (error) throw error;
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Добавление новой подписки
app.post('/subscriptions', async (req, res) => {
  try {
    const { userId, name, price, billingDate, serviceLogo } = req.body;
    if (useMock) {
      const item = {
        id: String(Date.now()),
        user_id: userId,
        name,
        price,
        billing_date: billingDate,
        service_logo: serviceLogo,
      };
      mock.subscriptions.push(item);
      res.status(201).json(item);
      return;
    }
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{ 
        user_id: userId, 
        name, 
        price, 
        billing_date: billingDate, 
        service_logo: serviceLogo,
      }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// Обновление подписки
app.put('/subscriptions/:id', async (req, res) => {
  try {
    const { name, price, billingDate, serviceLogo } = req.body;
    if (useMock) {
      const idx = mock.subscriptions.findIndex(s => s.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Not found' });
      const prev = mock.subscriptions[idx];
      const next = {
        ...prev,
        name,
        price,
        billing_date: billingDate,
        service_logo: serviceLogo,
      };
      mock.subscriptions[idx] = next;
      res.json(next);
      return;
    }
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ 
        name, 
        price, 
        billing_date: billingDate, 
        service_logo: serviceLogo,
      })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Удаление подписки
app.delete('/subscriptions/:id', async (req, res) => {
  try {
    if (useMock) {
      const before = mock.subscriptions.length;
      mock.subscriptions = mock.subscriptions.filter(s => s.id !== req.params.id);
      if (mock.subscriptions.length === before) return res.status(404).json({ error: 'Not found' });
      return res.status(204).send();
    }
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});