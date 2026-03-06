import express from 'express'

const app = express();
const PORT = 3000;

app.get('/api', (req,res) => {
    res.json({ message: 'api funcionando'});
    
});

app.listen(PORT, () => {
    console.log(`Backend rodando na porta ${PORT}/api`);
});
