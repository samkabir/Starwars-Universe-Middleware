const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// ==================== Search Endpoints ====================
// Example /api/people/search?name=Luke


app.get('/api/:resourceName/search', async (req, res) => {
  const { resourceName } = req.params;
  const query = req.query.name;
  
  const validResources = ['films', 'people', 'planets', 'species', 'starships', 'vehicles'];
  if (!validResources.includes(resourceName)) {
    return res.status(400).json({ 
      error: 'Invalid resource name', 
      validResources: validResources 
    });
  }

  try {
    let response= await axios.get(`https://www.swapi.tech/api/${resourceName}/?name=${encodeURIComponent(query)}`);
    
    res.json(response.data);
  } catch (error) {
    console.error(`${resourceName} search error:`, error.message);
    res.status(500).json({ error: `Failed to fetch ${resourceName} search results from SWAPI` });
  }
});




// ==================== Pagination Endpoint ====================
// Example /api/pagination/people , params: 2


app.get('/api/pagination/:resourceName', async (req, res) => {
  const { resourceName } = req.params;
  const page = req.query.page || 1;
  
  const validResources = ['films', 'people', 'planets', 'species', 'starships', 'vehicles'];
  if (!validResources.includes(resourceName)) {
    return res.status(400).json({ 
      error: 'Invalid resource name', 
      validResources: validResources 
    });
  }
  
  if (isNaN(page) || page < 1) {
    return res.status(400).json({ error: 'Invalid page number' });
  }

  try {
    const response = await axios.get(`https://www.swapi.tech/api/${resourceName}?page=${page}&limit=12&expanded=true`);
    res.json(response.data);
  } catch (error) {
    console.error(`${resourceName} fetch error:`, error.message);
    res.status(500).json({ error: `Failed to fetch ${resourceName}` });
  }
});



// ==================== Specific ID Endpoint ====================
// Example /api/people/1


app.get('/api/:resourceName/:id', async (req, res) => {
  const { resourceName, id } = req.params;
  
  const validResources = ['films', 'people', 'planets', 'species', 'starships', 'vehicles'];
  if (!validResources.includes(resourceName)) {
    return res.status(400).json({ 
      error: 'Invalid resource name', 
      validResources: validResources 
    });
  }
  
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: `Invalid ${resourceName} ID` });
  }

  try {
    const response = await axios.get(`https://www.swapi.tech/api/${resourceName}/${id}`);
    res.json(response.data);
  } catch (error) {
    console.error(`${resourceName} fetch error:`, error.message);
    if (error.response?.status === 404) {
      res.status(404).json({ error: `${resourceName} not found` });
    } else {
      res.status(500).json({ error: `Failed to fetch ${resourceName} from SWAPI` });
    }
  }
});




// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use('/{*any}', (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});




app.listen(PORT, () => {
  console.log(`Middleware server running on port ${PORT}`);
});
