import dotenv from 'dotenv';
import { app } from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Old Brother API rodando em http://localhost:${PORT}`);
});
