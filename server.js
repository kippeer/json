const cors = require('cors');
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Middleware para lidar com o corpo das solicitações JSON

// Caminho para o arquivo JSON
const jsonFilePath = path.join(__dirname, 'cars.json');

// Lê o arquivo JSON uma vez no início
let carsData = [];
try {
  carsData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
} catch (error) {
  console.error('Error reading cars.json:', error);
}

// Rota para obter todos os carros do arquivo JSON
app.get('/api/cars', (req, res) => {
  res.json(carsData);
});

// Rota para cadastrar um novo carro no arquivo JSON
app.post('/api/cars', (req, res) => {
  const newCar = req.body;

  // Adiciona um novo ID incremental
  newCar._id = (Math.max(0, ...carsData.map((car) => parseInt(car._id, 10))) + 1).toString();

  // Adiciona o novo carro à lista
  carsData.push(newCar);

  // Salva a lista atualizada de carros no arquivo JSON
  fs.writeFileSync(jsonFilePath, JSON.stringify(carsData, null, 2));

  res.json(newCar);
});

// Adiciona uma rota para servir os arquivos estáticos do React
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Rota para lidar com todas as outras solicitações e servir o aplicativo React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Rota para editar um carro existente
app.put('/api/cars/:carId', (req, res) => {
  const carId = req.params.carId;
  const updatedCar = req.body;

  // Encontra o índice do carro no array
  const carIndex = carsData.findIndex((car) => car._id === carId);

  // Se o carro for encontrado, atualiza os dados e salva no arquivo JSON
  if (carIndex !== -1) {
    carsData[carIndex] = { ...carsData[carIndex], ...updatedCar };
    fs.writeFileSync(jsonFilePath, JSON.stringify(carsData, null, 2));
    res.json(carsData[carIndex]);
  } else {
    res.status(404).json({ error: 'Carro não encontrado' });
  }
});

// Rota para excluir um carro existente
app.delete('/api/cars/:carId', (req, res) => {
  const carId = req.params.carId;

  // Filtra o array para remover o carro pelo _id
  carsData = carsData.filter((car) => car._id !== carId);

  // Salva a lista atualizada de carros no arquivo JSON
  fs.writeFileSync(jsonFilePath, JSON.stringify(carsData, null, 2));

  res.json({ message: 'Carro excluído com sucesso' });
});
