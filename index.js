import bodyParser from 'body-parser';
import express from 'express';
import axios from 'axios';

const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const API_KEY = '8c6b152d07203dcb22087433975e3057';

let data = [];
let lat;
let lon;
let content;

function Capitalizing(text) {
  return text[0].toUpperCase() + text.slice(1).toLowerCase();
}
function displayTime(timezone) {
  const timeZoneOffsetMs = timezone * 1000;
  const utcTime = new Date();
  const localTime = new Date(utcTime.getTime() + timeZoneOffsetMs);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const year = localTime.getUTCFullYear();
  const month = months[localTime.getUTCMonth()];
  const day = days[localTime.getUTCDay()];
  const date = localTime.getUTCDate();
  const hour = String(localTime.getUTCHours()).padStart(2, '0');
  const minute = String(localTime.getUTCMinutes()).padStart(2, '0');

  const formattedTime = `${day}, ${month} ${date}, ${year} at ${hour}:${minute}`;
  return formattedTime;
}

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.post('/search', async (req, res) => {
  try {
    if (!req.body.search) {
      throw new Error('Please enter a city.');
    }
    const result = await axios.get(
      'http://api.openweathermap.org/geo/1.0/direct',
      {
        params: {
          q: Capitalizing(req.body.search),
          appid: API_KEY,
        },
      }
    );
    data = result.data;
    if (data.length === 0) {
      throw new Error(
        'No results found. Please try again with a different city.'
      );
    }
    lat = data[0].lat;
    lon = data[0].lon;
    res.redirect('/weather');
  } catch (error) {
    res.render('index.ejs', {
      error: error.message,
    });
  }
});

app.get('/weather', async (req, res) => {
  try {
    const result = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    content = result.data;

    res.render('weather.ejs', {
      content: content,
      data: data,
      image: `https://openweathermap.org/img/wn/${content.weather[0].icon}@2x.png`,
      time: displayTime(content.timezone),
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
